# Описание

Данная статья описывает как создать приложение на java для Sega Mega Drive.

В файле [not_included.md](https://github.com/Mark65537/Java-for-sega-genesis/blob/main/not_included.md) содержаться параграфы не вошедшие в основную статью.

[Ссылка](https://github.com/Mark65537/Empty-project-Java-Grinder) на шаблонный проект для Java Grinder.

# Добавление нового перевода

Для добавления своего языка нужно добавить файл lang.html, где lang это ваш язык, после этого нужно добавить новый элемент в список в файл index.html.

```html
<nav>
    <ul>
        <li><a href="#" onclick="loadPage('en')">English</a></li>
        <li><a href="#" onclick="loadPage('ru')">Русский</a></li>
        <li><a href="#" onclick="loadPage('lang')">Свой язык</a></li>
    </ul>
</nav>
```
