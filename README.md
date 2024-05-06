Java для Sega Mega Drive — возможно ли это?

Введение

Этим проектом я хотел ответить на один вопрос: возможно ли написать игру на Java для Sega Mega Drive/Genesis. Не хочу раскрывать спойлеры, но ответом будет «да».
Несколько лет назад я повстречал проект Java Grinder, который позволяет писать код на Java и фактически интерпретировать получившийся после компиляции байт-код в код на Ассемблере 68K. После того как он получает файлы .class он интерпретирует их в команды ассемблерного кода для реального процессора M68000. Если файлу класса нужны другие файлы классов, то они тоже считываются и обрабатываются. Все вызовы методов API записываются в вывод, или как встроенный ассемблерный код, или как вызовы предварительно написанных функций, выполняющих предназначенную им задачу.
Сама по себе система довольно проста, но мне ещё многому предстоит научиться, а качественную информацию искать не так просто. На самом деле в этом проекте я впервые занялся настоящим программированием для Mega drive.




Содержание
Подготовка
Шрифт
Графика
3.1 Палитра
3.2 Задний фон
3.3 Спрайты
Управление
Музыка
Ограничения
Демо





























Подготовка
Java Grinder изначально был сделан для линукса, и на данный момент нет порта для windows, поэтому либо придётся использовать линукс, либо WSL. Я использовал WSL, поэтому все дальнейшии примеры буду приводить на нем. Чтобы начать создавать свои проекты необходимо выполнить несколько шагов:

установите в ваш wsl утилиту make для сборки проектов и javac(openjdk) для компиляции java файлов. 
клонируйте репозиторий Java Grinder, перейдите в папку репозитория и выполните команду wsl make. В результате должен создаться файл java_grinder
выполните команду make java для создания библиотеки классов JavaGrinder.jar в папке build 
клонируйте репозиторий naken_asm, перейдите в папку репозитория и выполните команду ./configure, после этого выполните команду make. Созданный файл naked_asm переместите в директорию Java Grinder. 
Создайте папку projects в директории Java Grinder или перейдите в папку samples и клонируйте туда репозиторий empty-project. Это будет ваш шаблонный проект для создания программ и игр на Sega Mega Drive/Genesis. При создании новой игры просто скопируйте папку проекта и поменяйте название на название вашего проекта.
Если у вас по какой-то причине не получается скомпилировать необходимые файлы, вы можете воспользоваться моими заранее скомпилированными файлами. 

Шрифт
На данный момент в шрифте доступны только заглавные английские буквы. 
Для вывода текста на экран нужно сначала использовать функцию для установки начальных координат, где будет размещаться текст, SegaGenesis.setCursor(int X, int Y), X должен располагаться в диапазоне от 0 до 28, Y — от 0 до 40. После этого можно использовать либо функцию printChar(char c), которая печатает один символ, либо print(String text), которая печатает текст целиком. Для удобства можете использовать функции из класса Text. Будьте внимательны, функции print не переносят текст на новую строку, если вы вышли за пределы экрана, вам придется регулировать это самим.


 ГРАФИКА
Чтобы научиться выводить что-либо на экран, необходимо разобраться в структуре графики на платформе Sega и в методах её кодирования. Подробнее об этом можно узнать в данной статье. Вкратце, в Sega используется тайловая графика, где каждый тайл имеет размер 8x8 пикселей и в памяти рома занимает 32 байта. Для вывода изображения на экран используется чип VDP(Video Display Processor). 
Данные в VDP загружаются в определенном формате, который тесно связан с палитрой. Суть этого кодирования заключается в присвоении каждому пикселю тайла определенного индекса цвета из палитры, который может варьироваться от 0 до 15(0x0-0xF).  Продемонстрируем данный  подход на примере персонажа Lemming из игры Lemmings Return для Mobile. Этот персонаж является самым маленьким из мне известных и использует все 16 цветов палитры, полностью помещаясь всего на два тайла. Если вы знаете других таких же маленьких персонажей или меньше, напишите в комментариях.
Тайлы лемминга увеличенные вдвое + изображение палитры + демонстрация как данные храниться в VDP:

3.1 ПАЛИТРА
Продолжим разбор графики с того, как хранится палитра в Java Grinder, поскольку она используется в других графических элементах. 
В Sega Mega Drive используется 9 битная палитра. Об этом можно прочитать здесь или здесь. В памяти консоли один цвет палитры занимает 2 байта. Например значение белого цвета 0хEEE  будет храниться как 0x0E, 0xEE.
В Java Grinder палитра храниться в массиве short[] palette и загружается с помощью API в VDP CRAM ("Color RAM" — «цветовое ОЗУ»).
В массиве palette содержаться значения цветов 9 битной палитры в 16-ричном формате от 0x000 до 0xEEE. Максимальное количество элементов в массиве не должно превышать 16. Если вы используете меньше цветов, то рекомендуется неиспользуемые цвета приравнять 0x0.
Пример палитры лемминга из предыдущего примера:
public static short[] palette =
  {
   
    0xECE, 0x0A0, 0x0C0, 0x080, 0xEEE, 0x88C, 0xAAE, 0x246,
    0x8AE, 0x68C, 0x66A, 0xE80, 0xEA0, 0xC60, 0xC40, 0xA00
   
  };
Значение палитры можно преобразовать из RGB в 9 битную по данному алгоритму
((color.B >> 5) << 9) | ((color.G >> 5) << 5) | ((color.R >> 5) << 1)
К сожалению точное обратное преобразование получить почти невозможно, так как на одно значение приходиться 32 RGB цвета. Вы можете воспользоваться данным кодом для обратного преобразования, но он не гарантирует, что вы получите такие же цвета, как на эмуляторе или железе. 

b = (color9bit >> 9) & 0x7;
g = (color9bit >> 5) & 0x7;
r = (color9bit >> 1) & 0x7;
Color = (r << 5, g << 5, b << 5);

Если хотите точно конвертировать 9-битную палитру в RGB, вам необходимо найти таблицу соответствий или вывести ее самому.


3.2 Задний фон(background)

Для создания заднего фона и вывода его на экран нам потребуется 4 вещи:
 массив palette
Смотри предыдущий раздел.
массив pattern
В этом массиве хранятся тайлы. Записываются они построчно, сверху вниз, слева направо. Каждый элемент массива это одна строка тайла
массив images
Это так называемая тайловая карта(tilemap) в которой последовательно хранятся индексы тайлов
Вызовы API для загрузки данных в VDP
Нам понадобится 3 функции API:
SegaGenesis.setPaletteColors(short[] palette);
Загрузка палитры в VDP CRAM, начиная с индекса 0.
SegaGenesis.setPatternTable(int[] pattern);
Загрузка тайлов в VDP VRAM, начиная с индекса 0.
SegaGenesis.setImageData(int[] image);
Загрузка тайловой карты в конец VDP

полный код класса заднего фона.

Пример изображения которое должно вывестись на экран:


3.3 Спрайты
Спрайты создаются очень похоже на задний фон, но для их отрисовки требуется больше вызовов API. Кроме того, спрайты не содержат тайловую карту, то есть они не оптимизированы, в отличие от заднего фона. Это означает, что одни и те же тайлы спрайтов могут встречаться несколько раз в VDP. На самом деле это можно оптимизировать, но данная тема выходит за рамки данной статьи, об этом можете посмотреть здесь.
Спрайты отрисовываются в виртуальном пространстве 512x512 пикселей, где координаты (128,128) совпадают с верхним левым углом телеэкрана.
Внутри консоли спрайты рендерятся в обратном порядке, т.е. сверху вниз, слева направо.
Пример:

Для вывода спрайта на экран нам нужно использовать функции API:
SegaGenesis.setPaletteColorsAtIndex(int index, short[] palette)
функция работает аналогично функции SegaGenesis.setPaletteColors(short[] palette), которая используется для загрузки палитры заднего фона, единственное отличие в том что можно задать индекс начала загрузки палитры. Значение индекса должно быть от 0 до 63, если передать индекс за пределы диапазона, то это может привести к непредвиденным последствиям.
SegaGenesis.setPatternTableAtIndex(int index, int[] patterns);
Работает аналогично функции SegaGenesis.setPatternTable(int[] pattern). index это адрес начало загрузки тайлов в VDP, не рекомендуется записывать в индекс 0x1120, Так как туда загружается шрифт.
SegaGenesis.setSpritePosition(int index, int x, int y);
Настроить позицию спрайта по индексу спрайта из sprite pool. Чтобы спрайт отобразился на экране, значения x и y должны быть в диапазоне x=(128, 448) y=(128, 352). 
SegaGenesis.setSpriteConfig1(int index, int value);
это так называемое первое слово настройки спрайта, в которое входит: горизонтальный размер спрайта в тайлах, вертикальный  размер спрайта в тайлах, индекс следующего спрайта который нужно отобразить.
SegaGenesis.setSpriteConfig2(int index, int value);
Второе слово в которое входит: номер палитры, индекс спрайта в VDP.

Пример кода спрайта компьютерной мыши.
Управление
На данный момент реализовано только 3 кнопочное управление, без кнопки Mode. В API содержится метод для получения кода текущей нажатой кнопки(getJoypadValuePort1), и константы кодов кнопок.
public static final int JOYPAD_START = 0x2000;
public static final int JOYPAD_A = 0x1000;
public static final int JOYPAD_C = 0x0020;
public static final int JOYPAD_B = 0x0010;
public static final int JOYPAD_RIGHT = 0x0008;
public static final int JOYPAD_LEFT = 0x0004;
public static final int JOYPAD_DOWN = 0x0002;
public static final int JOYPAD_UP = 0x0001;
Но если вы попробуете написать что то подобное, то это не будет работать:
	int keyCode=SegaGenesis.getJoypadValuePort1();
	if (keyCode == JOYPAD_A){
		//Действия для кнопки А
}
На текущий момент не известно как автор задумывал работу с джойстиком, так как на данный момент в единственном демонстрационном  примере для Sega нету реализации работы с ними. 
Экспериментальным путем удалось выяснить, истинное значения констант(если кто знает почему используются именно эти значения пожалуйста напишите в комментарии)  и то что значения для каждой клавиши могут меняться со временем в диапазоне от 0x0000 до 0xF000, то есть не являются константами. Для реализации управления нужно использовать данный код:
Примечание: в данном коде не реализовано многокнопочное управление. Это означает, что за раз можно нажать только одну кнопку, и пока вы не отпустите предыдущую, нельзя будет нажать следующую.
keyCode = SegaGenesis.getJoypadValuePort1();      
//проверка нажатий кнопок
      if(!pressed){
        for (int i = 0x0000; i <= 0xF000; i+=0x0100) {
              // проверка нажатия кнопки вверх
              if(keyCode == (i+0x0081) && y > 0x7F) {                      
                
                break;
              }
             
              // проверка нажатия кнопки вниз            
              if(keyCode == (i+0x0082) && y < 0x160) {                      
                
                break;
              }
             
              // проверка нажатия кнопки влево                    
              if(keyCode == (i+0x0084) && x > 0x7E) {                      
                
                break;                
              }


              // проверка нажатия кнопки вправо          
              if(keyCode == (i+0x0088) && x < 0x1C0) {                      
                
                break;
              }


              // проверка нажатия кнопки A        
              if(keyCode == (i+0xD080)) {


                pressed = true;
                break;
              }


              // проверка нажатия кнопки B          
              if(keyCode == (i+0x0090)) {                
                         
                pressed = true;
                break;
              }


              // проверка нажатия кнопки C          
              if(keyCode == (i+0x00A0)) {                      


                pressed = true;
                break;
              }


              // проверка нажатия кнопки START          
              if(keyCode == (i+0xE080)) {
                
                pressed = true;
                break;
              }
        }          
      }
      else if(keyCode == 0xCC80 || keyCode == 0xC080) {
        pressed = false;
      }


Музыка
Для музыки используются API методы 
   	loadZ80(byte[] code)
  resetZ80()
pauseZ80()
  startZ80()
Для того, чтобы воспроизвести звук или музыку нужно знать куда ее загружать. В Sega для проигрывания музыки и звуков используется отдельный процессор Zilog Z80.
Формат звука должен быть моно с частотой 8-bit и с определенным значением герц.
Максимальный размер звука который вы можете загрузить в Z80 это 8 Кб(написать точное значение в байтах) минус несколько байт на код воспроизведения и того получается чуть меньше 8 Кб, этого конечно же недостаточно для полноценной музыки. Есть 3 способа как воспроизвести звук: DAC(Digital to Analog Converter), Yamaha 2612, PSG(Programmable Sound Generator). Мы будем использовать DAC, так как PSG в основном используется для белого шума, а как загрузить музыку в Yamaha 2612 я так и не разобрался. Для того чтобы загрузить музыку которая больше 8Кб нам нужно будет загружать ее частично в Z80 и подать в него в оффсет … абсолютный адрес начала данных музыки в роме(Данный метод был взят из движка GINCS с которым я работал до этого). Для этого нам нужно сначала загрузить музыку в ром, потом найти абсолютный адрес начала музыки в роме и после записать код в Z80 с помощью функции loadZ80(byte[] code) с адресом вставленным в оффсет …
Для того чтобы записать данные музыки в ром нам сначала нужно подготовить файл который будет звучать в нашей игре. Файл должен быть в формате .wav(с другими не экспериментировал, скорей всего тоже получиться), с частотой 8-bit, в моно формате, с   определенным количеством герц, герцы подбирать не обязательно, это нужно для того что бы музыка звучала одинаково как на компьютере, так и на железе. После того как подготовили файл нужно вытащить из него данные в raw формате, для этого можете воспользоваться скриптом или найти другой способ. Далее эти данные нужно преобразовать в Java массив byte[], он отличается от массива байт на других языках. Значение массива byte должно быть от 0 до -1, причем если значение будет больше 127, то значение байт будет -128, также не желательно писать байты в 16-ричном формате, так как в Java тип hex значений числа после 0x79 будут int, и нужно будет приводить каждое значение к типу byte. 
К сожалению тут мы сталкиваемся с одним из ограничений Java, максимальный размер статического массива не должен превышать 8 231 элементов, так как самый большой тип данных в Grinder это int, то получаем 8 231 * 32 / 1024 = 263392 байт или чуть больше 257 Килобайт. Именно такой длины музыкальный файл мы можем загрузить без проблем в память ром, просто сославшись на него в main.java(например: byte[] b = z80_code) или создать пустую функцию где у вас расположен массив z80_code и просто вызвать ее(например: public static void init(){}). Если этого размера вам недостаточно, то придется создавать несколько массивов и вызывать их все по очереди в функции обертке. К сожалению, запись музыки в ром один в один не получиться, потому что между массивами будет вставлено 4 байта вставить сюда точные значения байтов. скорей всего это код присваивании ссылки массива. К сожалению пока можно либо проиграть музыку, либо проиграть звуковой эффект, но не одновременно.


Ограничения
Здесь собраны ограничения с которыми я столкнулся во время разработки.

Нельзя создавать объекты
Нельзя оставлять пустое условие if
нельзя создавать массив pattern, если ты вызываешь метод draw()
Нельзя присваивать enum начальное значение. Есть возможность создавать enum, но нельзя их использовать.
поля класса обязательно должны быть static final или без final, но тогда без инициализации.
нельзя занимать SPRITE_LOCATION = 1120, Так как там находиться шрифт; 
Команды SegaGenesis.setPalettePointer(17); SegaGenesis.setPaletteColor(0x000); не понятно зачем нужны. может быть не работают
Максимальный размер статического массива не должен превышать 8 231 элементов
В шрифте доступны только большие английские буквы, БЕЗ ЦИФР.
Нельзя писать static public class Main
Не поддерживается тип long
Нельзя инициализировать поле в методе
Нельзя обратиться к элементу массива char[]. Например нельзя писать chr_arr[0]



















7. Демо
На данный момент существует всего два проекта сделанных на Java Grinder. 
 sega_genesis_java_demo.bin - это демо версия от разработчика для демонстрации возможности движка
Dr. Sukebe x-boobs - это эротически-юморная игра которая является портом игры с j2me

Возможно после ознакомления с данной статьей, увеличится интерес к теме, и появятся новые проектные инициативы.


Советы
если выдает ошибку Couldn't find “ИмяПоля”
** Error setting statics ../common/JavaCompiler.cxx:2416. попробуйте сделать поле final

Вывод
На текущий момент движок лучше всего подойдет для создания каких-нибудь живых книг или визуальных новелл, желательно без музыки или очень короткой, так как на нем очень просто отображать задний фон. Для более сложных проектов, таких как платформеры, лучше использовать другие движки, например SGDK или BasieGaxorz(BEX). Более полный список всех собранных движков можно посмотреть здесь.

Ссылки
https://habr.com/ru/articles/471914/




