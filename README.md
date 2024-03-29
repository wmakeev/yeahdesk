![logo](https://wmakeev-public-files.s3-eu-west-1.amazonaws.com/images/logos/yeahdesk-150.png)

# Yeahdesk

[![npm](https://img.shields.io/npm/v/yeahdesk.svg?cacheSeconds=1800&style=flat-square)](https://www.npmjs.com/package/yeahdesk)

> Библиотека для работы с [API](https://help.yeahdesk.ru/docs/for-developers/http-api) сервиса [Yeahdesk](https://yeahdesk.ru/)

## Содержание

<!-- TOC -->

- [Yeahdesk](#yeahdesk)
  - [Содержание](#содержание)
  - [Установка](#установка)
  - [Использование](#использование)
    - [Создание экземпляра](#создание-экземпляра)
    - [Авторизация](#авторизация)
      - [Передача токена при создании экземпляра](#передача-токена-при-создании-экземпляра)
      - [Передача токена в переменной окружения](#передача-токена-в-переменной-окружения)
  - [Общие понятия](#общие-понятия)
  - [API](#api)

<!-- /TOC -->

## Установка

> Поддерживаются версии node.js >=12

```
$ npm install yeahdesk
```

## Использование

### Создание экземпляра

```ts
import { Yeahdesk } from 'yeahdesk'

const yd = new Yeahdesk()

const persons = await yd.getPersons()
```

### Авторизация

#### Передача токена при создании экземпляра

```ts
const yd = new Yeahdesk(TOKEN)
```

#### Передача токена в переменной окружения

Если при создании экземпляра в конструкторе не указан токен, то будет попытка получить токен из переменной окружения `YEAHDESK_TOKEN`.

```ts
const yd = new Yeahdesk() // Токен из process.env.YEAHDESK_TOKEN
```

## Общие понятия

**Клиент** (Person) - карточка клиента в сервисе Yeahdesk

**Контакт** (Contact) - контактные данные входящие в карточку **Клиента** (email, номер телефона и пр.)

## API

> Чет пока не охото писать доки :) Может потом прикрутить автогенерашку. А так, всё есть в тестах. Да и комментарии к методам и аргументам старался писать максимально подробно (иначе сам запутался бы).
