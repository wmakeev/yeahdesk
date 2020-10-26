export enum ContactType {
  Id = 'id',
  Mail = 'mail',
  Phone = 'phone'
}

export enum ContactService {
  Mail = 'mail',
  Phone = 'phone',
  Facebook = 'facebook',
  Vk = 'vk',
  Whatsapp = 'whatsapp',
  Chatra = 'chatra',
  Telegram = 'telegram',
  Skype = 'skype'
}

export enum ContactOrigin {
  PBX = 'pbx',
  Manual = 'manual'
}

export interface BasicPersonContact {
  /** Значение контакта */
  value: string

  /** Тип контакта */
  type: ContactType

  /** Какому сервису пренадлежит контакт в `value` */
  service: ContactService
}

/** Контакт */
export interface PersonContact extends BasicPersonContact {
  /** Идентификатор контакта */
  id: string

  /** Cервис, который создал данный контакт */
  origin: ContactService | ContactOrigin

  /** Отметка что Контакт удален */
  status?: 'deleted'
}

export interface BasicPerson {
  /** Наименование клиента */
  name?: string

  /** Описание клиента */
  description?: string
}

/** Клиент */
export interface Person extends BasicPerson {
  /** Идентификатор клиента */
  _id: string

  /** Идентификатор аккаунта */
  accountId: string

  /* eslint @typescript-eslint/no-explicit-any: 0 */
  /** ??? */
  agent?: any | null // TODO agent

  /** Идентификатор аккаунта */

  /** Дата создания в формате строки */
  createdAt: string

  /** Список контактов клиента */
  contacts?: PersonContact[]

  /** Цвет аватара в формате `#FFFFFF` */
  avatarBgColor?: string

  /** Отметка что Клиент удален */
  status?: 'deleted'
}
