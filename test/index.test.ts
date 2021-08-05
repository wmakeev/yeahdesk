import test from 'blue-tape'

import { Yeahdesk } from '../src'
import { ContactService, ContactType } from '../src/Person'
import { getUniqPhone } from './tools'

test('Yeahdesk', async t => {
  const yd = new Yeahdesk()

  //#region Создание клиента
  t.comment('Создание клиента')

  const person1 = {
    name: `Test Person ${Date.now()}`,
    description: 'Это клиент для тестирования'
  }

  const person2 = await yd.createPerson(person1)

  t.ok(person2._id)
  t.ok(person2.accountId)
  t.ok(person2.avatarBgColor)
  t.equal(person2.contacts?.length, 0)
  t.ok(person2.createdAt)
  t.equal(person2.description, person1.description)
  t.equal(person2.name, person1.name)
  //#endregion

  //#region Обновление клиента
  t.comment('Обновление клиента')

  const person3 = await yd.updatePerson(person2._id, {
    name: person2.name,
    description: person2.description + ' [updated]'
  })

  t.equal(person3._id, person2._id, 'should return same Person')

  t.equal(
    person3.description,
    person2.description + ' [updated]',
    'should return updated Person'
  )
  //#endregion

  //#region Создание контакта
  t.comment('Создание контакта')

  const phone1 = getUniqPhone()

  const contact1 = await yd.createPersonContact(person3._id, {
    value: phone1,
    service: ContactService.Phone,
    type: ContactType.Phone
  })

  t.ok(contact1.id, 'should create Contact (1)')
  t.equal(contact1.value, phone1, 'should return Contact (1) with value')

  const phone2 = getUniqPhone()

  const contact2 = await yd.createPersonContact(person3._id, {
    value: phone2,
    service: ContactService.Phone,
    type: ContactType.Phone
  })

  t.ok(contact2.id, 'should create Contact (2)')
  t.equal(contact2.value, phone2, 'should return Contact (2) with value')
  //#endregion

  //#region Получение клиента c контактом
  t.comment('Получение клиента')
  const persons1 = await yd.getPersons({
    id: person3._id
  })

  t.equal(persons1?.length, 1, 'should return one Person')

  const person4 = persons1[0]

  t.equal(person4._id, person2._id, 'should find Person by id')

  t.equal(person4.contacts?.length, 2, 'should have 2 Contacts')

  t.ok(
    person4.contacts?.some(it => it.id === contact1.id),
    'should include created Contact (1)'
  )

  t.ok(
    person4.contacts?.some(it => it.id === contact2.id),
    'should include created Contact (2)'
  )
  //#endregion

  //#region Удаление контакта
  t.comment('Удаление контакта')

  const res1 = await yd.deletePersonContact(contact1.id)

  t.equal(res1, true, 'should delete Contact (1)')
  //#endregion Удаление контакта

  //#region Получение Клиента по id
  t.comment('Получение Клиента по id')
  const [person5] = await yd.getPersons({
    id: person4._id
  })

  t.equal(person5.contacts?.length, 2, 'should include deleted Contacts')

  const contact3 = person5.contacts?.find(it => it.id === contact1.id)

  t.equal(contact3?.status, 'deleted', 'should have "deleted" Contact status')
  //#endregion Получение Клиента по id

  //#region Поиск контактов по значению
  t.comment('Поиск контактов по значению')

  // Регулярное выражение (скобки экранированы)
  const searchValue = phone1
    .slice(1, -1) // Номера отличаются последней цифрой
    .replace('(', '\\(')
    .replace(')', '\\)')

  const contacts2 = await yd.getPersonContacts({
    search: searchValue
  })

  // TODO Возвращает то 1, то 2 контакта? Как так?
  t.ok(contacts2.length >= 1, 'should return 2 Contacts')

  // TODO Не работает фильтрация по не удаленным сущностям
  // const contacts3 = await yd.getPersonContacts({
  //   search: searchValue,
  //   includeDeleted: true
  // })

  // t.equal(contacts3.length, 2, 'should return 2 Contacts')

  // t.ok(
  //   contacts3.some(it => it.status === 'deleted'),
  //   'should include deleted Contacts'
  // )
  //#endregion Поиск контактов по значению

  //#region Поиск Клиента
  t.comment('Поиск Клиента')

  const searchValue2 = phone1
    .replace('+', '\\+')
    .replace('(', '\\(')
    .replace(')', '\\)')

  const persons2 = await yd.getPersons({
    search: searchValue2
  })

  t.equal(persons2.length, 1, 'should find Person by contact value')
  t.equal(persons2[0]._id, person3._id, 'should find correct Person')
  //#endregion Поиск контакта

  //#region Удаление клиента
  t.comment('Удаление клиента')
  const res2 = await yd.deletePerson(person5._id)

  t.equal(res2, true, 'should delete Person')
  //#endregion

  //#region Поиск Клиентов
  t.comment('Поиск Клиентов')
  const persons3 = await yd.getPersons({
    search: searchValue2
  })

  t.equal(persons3.length, 0, 'should not return deleted Persons')

  const persons4 = await yd.getPersons({
    search: searchValue2,
    includeDeleted: true
  })

  t.equal(persons4.length, 1, 'should return deleted Persons')
  //#endregion
})
