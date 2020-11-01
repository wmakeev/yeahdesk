import path from 'path'
import qs, { ParsedUrlQueryInput } from 'querystring'
import fetch from 'node-fetch'
import {
  YeahdeskApiError,
  YeahdeskError,
  YeahdeskNotFoundError,
  YeahdeskRequestError
} from './errors'
import type {
  BasicPerson,
  BasicPersonContact,
  ContactService,
  ContactType,
  Person,
  PersonContact
} from './Person'

const { YEAHDESK_ENDPOINT = 'app.yeahdesk.ru', YEAHDESK_TOKEN } = process.env

export class Yeahdesk {
  private token: string

  constructor(token?: string) {
    if (token) {
      this.token = token
    } else if (YEAHDESK_TOKEN) {
      this.token = YEAHDESK_TOKEN
    } else {
      throw new YeahdeskError('Для работы с сервисом необходимо указать токен')
    }
  }

  protected async fetchApi<T>(
    method: string,
    requestPath: string,
    queryParams?: Record<string, string | number>,
    body?: Object
  ): Promise<T> {
    const urlQuery: ParsedUrlQueryInput = {
      token: this.token,
      ...queryParams
    }

    const queryString = qs.encode(urlQuery)

    const resp = await fetch(
      `https://${path.join(YEAHDESK_ENDPOINT, requestPath)}?${queryString}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip'
        },
        body: body ? JSON.stringify(body) : undefined
      }
    )

    switch (resp.status) {
      // BAD_REQUEST
      case 400:
        throw new YeahdeskRequestError('Некорректный запрос', resp)

      // UNAUTHORIZED
      case 401:
        throw new YeahdeskRequestError('Запрос на авторизован', resp)

      // NOT_FOUND
      case 404:
        throw new YeahdeskRequestError('Вызван несуществующий метод', resp)

      // INTERNAL
      case 500:
        throw new YeahdeskRequestError('Внутреннаяя ошибка сервиса', resp)

      default: {
        if (resp.status !== 200) {
          throw new YeahdeskRequestError(
            'Некорректный код ответа - ${resp.status}',
            resp
          )
        }
      }
    }

    const data = await resp.json()

    if (data.err === 'ENOT_FOUND') {
      throw new YeahdeskNotFoundError('Запрашиваемый элемент не найден', resp)
    } else if (data.err) {
      throw new YeahdeskApiError(data.err, resp)
    }

    return data as T
  }

  /**
   * Создать клиента
   * @param person Данные клиента
   */
  async createPerson(person: BasicPerson) {
    return this.fetchApi<Person>(
      'POST',
      'api/clients/person/create',
      {},
      person
    )
  }

  /**
   * Получить список Клиентов по условию
   *
   * @param query Запрос на выборку клиентов
   */
  async getPersons(query: {
    id?: string

    /** (регулярное выражение) ищет в поле `name` и `сontacts.value` */
    search?: string

    /** Список типов */
    type?: ContactType[]

    /** Список сервисов */
    service?: ContactService[]

    /** Смещение результатов ответа (по умолчанию `0`) */
    offset?: number

    /** Ограничение на количество отдаваемых записей (по умолчанию `50`) */
    limit?: number

    /** Если `true`, то будут возвращены в том числе и удаленные контакты. */
    includeDeleted?: boolean
  }) {
    const queryParams: Record<string, string | number> = {}

    if (query.id) queryParams.id = query.id
    if (query.search) queryParams.search = query.search
    if (query.type) queryParams.type = query.type.join()
    if (query.service) queryParams.service = query.service.join()
    if (query.offset) queryParams.offset = query.offset
    if (query.limit) queryParams.limit = query.limit
    if (!query.includeDeleted) queryParams.needExistingRecords = 'true'

    return this.fetchApi<Person[]>(
      'GET',
      'api/clients/person/read',
      queryParams
    )
  }

  /**
   * Обновить клиента
   *
   * Если поле не указано, после обновления оно будет пустым в карточке Клиента
   *
   * @param id Идентификатор клиента
   * @param person Данные клиента
   */
  async updatePerson(id: string, person: BasicPerson) {
    const res = await this.fetchApi<{ result: Person }>(
      'POST',
      `api/clients/person/update/${id}`,
      {},
      person
    )

    return res.result
  }

  /**
   * Удаление клиента
   *
   * При вызове этого метода для Клиента устанавливается `{ status: 'deleted' }`
   *
   * @param id Идентификатор клиента
   */
  async deletePerson(id: string) {
    const res = await this.fetchApi<{ result: true }>(
      'POST',
      `api/clients/person/delete/${id}`
    )

    return res.result
  }

  /**
   * Добавить Контакт в карточку Клиента
   * @param personId Идентификатор клиента
   * @param contact Контакт
   */
  async createPersonContact(personId: string, contact: BasicPersonContact) {
    const res = await this.fetchApi<{ result: PersonContact }>(
      'POST',
      `api/clients/person/contacts/create/${personId}`,
      {},
      contact
    )

    return res.result
  }

  /**
   * Получить список Контактов по условию
   *
   * @param query Запрос на выборку Контактов
   */
  async getPersonContacts(query: {
    /** Идентификатор Клиента */
    personId?: string

    /** Идентификатор Контакта */
    id?: string

    /** Значение контакта */
    value?: string

    /** (регулярное выражение) ищет в поле `value` */
    search?: string

    /** Список типов */
    type?: ContactType[]

    /** Список сервисов */
    service?: ContactService[]

    // TODO Этот параметр в API не работает (написать разработчикам)
    /** Если `true`, то будут возвращены в том числе и удаленные контакты. */
    // includeDeleted?: boolean
  }) {
    const queryParams: Record<string, string | number> = {}

    if (query.personId) queryParams.contact_id = query.personId
    if (query.id) queryParams.id = query.id
    if (query.value) queryParams.value = query.value
    if (query.search) queryParams.search = query.search
    if (query.type) queryParams.type = query.type.join()
    if (query.service) queryParams.service = query.service.join()
    // if (!query.includeDeleted) queryParams.not_deleted = 'true'

    const res = await this.fetchApi<{ result: PersonContact[] }>(
      'GET',
      'api/clients/person/contacts/read',
      queryParams
    )

    return res.result
  }

  /**
   * Обновить Контакт
   *
   * @param id Идентификатор Контакта
   * @param contact Данные контакта
   */
  async updatePersonContact(id: string, contact: Partial<BasicPersonContact>) {
    const res = await this.fetchApi<{ result: PersonContact }>(
      'POST',
      `api/clients/person/contacts/update/${id}`,
      {},
      contact
    )

    return res.result
  }

  /**
   * Удаление контакта
   *
   * При вызове этого метода для Контакта устанавливается `{ status: 'deleted' }`
   *
   * @param id Идентификатор Контакта
   */
  async deletePersonContact(id: string) {
    const res = await this.fetchApi<{ result: true }>(
      'POST',
      `api/clients/person/contacts/delete/${id}`
    )

    return res.result
  }
}
