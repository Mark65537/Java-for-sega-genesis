
<br />
<p align="center" class="anim-fade-in">
  <a href="">
    <img src="./images/logo.jpg" alt="Logo" width="100%" height="auto">
  </a>
</p>  

# Java для Sega Mega Drive — возможно ли это?

## **Введение**

В этом проекте я хотел ответить на вопрос: возможно ли написать игру на Java для Sega Mega Drive/Genesis. Не хочу раскрывать спойлеры, но ответом будет «да».  
Несколько лет назад я повстречал проект [Java Grinder](http://www.mikekohn.net/micro/java_grinder.php), который позволяет писать код для различных ретро процессоров на Java, в том числе для Sega Mega Drive. По сути, он интерпретирует байт-код из файлов .class, полученных после компиляции, в код на Ассемблере 68K. Если файлу класса нужны другие файлы классов, то они тоже считываются и обрабатываются. Все вызовы методов API записываются в выходном коде, либо как встроенный ассемблерный код, либо как вызовы предварительно написанных функций, выполняющих свою задачу.  
Сама по себе система довольно проста, но мне ещё многому предстоит научиться, а качественную информацию искать не так просто. На самом деле в этом проекте я впервые занялся настоящим программированием для Mega Drive.

## **Содержание**

1. [Подготовка](#подготовка)  
2. [Шрифт](#шрифт)  
3. [Графика](#графика)  
   3.1 [Палитра](#3.1-палитра)  
   3.2 [Задний фон](#3.2-задний-фон\(background\))  
   3.3 [Спрайты](#3.3-спрайты)  
4. [Управление](#управление)  
5. [Звуки](#звуки)  
6. [Вывод](#вывод)  
7. [Демо](#демо)  
8. [Ограничения](#ограничения)

1. ## **Подготовка** {#подготовка}

Java Grinder изначально был сделан для линукса, и на данный момент нет порта для windows, поэтому либо придётся использовать линукс, либо WSL. Я использовал WSL, поэтому все дальнейшие примеры буду приводить на нем. Чтобы начать создавать свои проекты необходимо выполнить несколько шагов:

1. установите в ваш wsl утилиту make для сборки проектов и javac(openjdk) для компиляции java файлов.   
2. клонируйте репозиторий [Java Grinder](https://github.com/mikeakohn/java_grinder), перейдите в папку репозитория и выполните команду wsl make. В результате должен создаться файл java_grinder.  
3. выполните команду make java для создания библиотеки классов JavaGrinder.jar в папке build.  
4. клонируйте репозиторий [naken_asm](https://github.com/mikeakohn/naken_asm), перейдите в папку репозитория и выполните команду ./configure, после этого выполните команду make. Созданный файл naked\_asm переместите в директорию Java Grinder.   
5. Создайте папку projects в директории Java Grinder или перейдите в папку samples и клонируйте туда репозиторий [Empty-project-Java-Grinder](https://github.com/Mark65537/Empty-project-Java-Grinder). Это будет ваш шаблонный проект для создания программ и игр на Sega Mega Drive/Genesis. При создании новой игры просто скопируйте папку проекта и поменяйте название на название вашего проекта.  
   

Если у вас по какой-то причине не получается скомпилировать необходимые файлы, вы можете воспользоваться моими заранее скомпилированными [файлами](https://github.com/Mark65537/Java-Grinder-Setup). 

2. ## **Шрифт** {#шрифт}

На данный момент в шрифте доступны только заглавные английские буквы.   
Для вывода текста на экран нужно сначала использовать функцию для установки начальных координат, где будет размещаться текст, SegaGenesis.setCursor(int X, int Y), X должен располагаться в диапазоне от 0 до 28, Y — от 0 до 40\. После этого можно использовать либо функцию SegaGenesis.printChar(char c), которая печатает один символ, либо SegaGenesis.print(String text), которая печатает текст целиком. Для удобства можете использовать функции из класса [Text](https://github.com/Mark65537/Empty-project-Java-Grinder/blob/master/src/ConsoleHelper/Text.java). Будьте внимательны, функции print не переносят текст на новую строку, если вы вышли за пределы экрана, вам придется регулировать это самим.

3. ##  **ГРАФИКА** {#графика}

Чтобы научиться выводить что-либо на экран, необходимо разобраться в структуре графики на платформе Sega и в методах её кодирования. Подробнее об этом можно узнать в данной [статье](https://habr.com/ru/articles/471914/). Вкратце, в Sega используется [тайловая графика](https://ru.wikipedia.org/wiki/Тайловая_графика), где каждый тайл имеет размер 8x8 пикселей и в памяти рома занимает 32 байта. Для вывода изображения на экран используется чип VDP(Video Display Processor).   
Данные в VDP загружаются в определенном формате, который тесно связан с палитрой. Суть этого кодирования заключается в присвоении каждому пикселю тайла определенного индекса цвета из палитры, который может варьироваться от 0 до 15(0x0-0xF).  Продемонстрируем данный  подход на примере персонажа [Lemming](https://www.spriters-resource.com/mobile/lemmingsreturn/sheet/53626/) из игры [Lemmings Return](https://www.spriters-resource.com/mobile/lemmingsreturn/) для Mobile. Этот персонаж является самым маленьким из мне известных, который использует все 16 цветов палитры и полностью помещается всего на два тайла. Если вы знаете других таких же маленьких персонажей или меньше, напишите в комментариях.  
Тайлы лемминга увеличенные вдвое \+ изображение палитры \+ демонстрация как данные храниться в VDP:  
![][image1]

### **3.1 ПАЛИТРА** {#3.1-палитра}

Давайте продолжим обсуждение графики и рассмотрим, как хранится палитра в Java Grinder. Это важно для понимания работы других графических элементов.  
В Sega Mega Drive используется 9 битная палитра. Подробнее об этом можно прочитать [здесь](https://en.wikipedia.org/wiki/List_of_video_game_console_palettes#Mega_Drive/Genesis_and_Pico) или [здесь](https://segaretro.org/Sega_Mega_Drive/Palettes_and_CRAM). В памяти консоли один цвет палитры занимает 2 байта. Например значение белого цвета 0хEEE  будет храниться как 0x0E, 0xEE.  
В Java Grinder палитра храниться в массиве short\[\] palette и загружается с помощью API метода SegaGenesis.setPaletteColorsAtIndex(int index, short\[\] palette) в VDP CRAM ("Color RAM" — «цветовое ОЗУ»).  
В массиве palette содержаться значения цветов 9 битной палитры в 16-ричном формате от 0x000 до 0xEEE. Максимальное количество элементов в массиве не должно превышать 16\. Если вы используете меньше цветов, то рекомендуется неиспользуемые цвета приравнять 0x000.  
Пример палитры лемминга из [предыдущего раздела](#графика):  
public static short\[\] palette \=  
  {     
    0xECE, 0x0A0, 0x0C0, 0x080, 0xEEE, 0x88C, 0xAAE, 0x246,  
    0x8AE, 0x68C, 0x66A, 0xE80, 0xEA0, 0xC60, 0xC40, 0xA00   
  };  
Значение палитры можно преобразовать из RGB в 9 битную по данному алгоритму  
((color.B \>\> 5\) \<\< 9\) | ((color.G \>\> 5\) \<\< 5\) | ((color.R \>\> 5\) \<\< 1).  
К сожалению точное обратное преобразование получить почти невозможно, так как на одно значение приходиться 32 RGB цвета. Вы можете воспользоваться данным кодом для обратного преобразования, но он не гарантирует, что вы получите такие же цвета, как на эмуляторе или железе. 

b \= (color9bit \>\> 9\) & 0x7;  
g \= (color9bit \>\> 5\) & 0x7;  
r \= (color9bit \>\> 1\) & 0x7;  
Color \= (r \<\< 5, g \<\< 5, b \<\< 5);

Если хотите точно конвертировать 9-битную палитру в RGB, вам необходимо найти таблицу соответствий или вывести ее самому.

### **3.2 Задний фон(background)** {#3.2-задний-фон(background)}

Для создания заднего фона и вывода его на экран нам потребуется 4 вещи:

1. массив palette из [предыдущего раздела.](#3.1-палитра)  
2. массив pattern  
   В этом массиве хранятся отдельные части изображения — тайлы. Они записываются последовательно, сверху вниз и слева направо. Каждый элемент массива представляет собой одну строку тайла.  
3. массив images  
   Это так называемая тайловая карта(tilemap) в которой последовательно хранятся индексы тайлов из массива pattern.  
4. API для загрузки данных в VDP:  
* **SegaGenesis.setPaletteColors(short\[\] palette):**

Загрузка палитры в VDP CRAM, начиная с индекса 0\.

* **SegaGenesis.setPatternTable(int\[\] pattern):**

Загрузка тайлов в VDP VRAM, начиная с индекса 0\.

* **SegaGenesis.setImageData(int\[\] image);**

Загрузка тайловой карты в конец VDP

Пример [кода](https://github.com/Mark65537/Empty-project-Java-Grinder/blob/master/res/images/ImgJavaGrinder.java) класса заднего фона, который содержит данное изображение:  
![][image2]

### **3.3 Спрайты** {#3.3-спрайты}

Спрайты создаются очень похоже на задний фон, но для их отрисовки требуется больше вызовов API. Кроме того, спрайты не содержат тайловую карту, то есть они не оптимизированы, в отличие от заднего фона. Это означает, что одни и те же тайлы спрайтов могут встречаться несколько раз в VDP. На самом деле это можно оптимизировать, но данная тема выходит за рамки данной статьи, об этом можете почитать [здесь](https://under-prog.ru/sgdk-optimiziruem-sprajty/).  
Спрайты отрисовываются в виртуальном пространстве 512x512 пикселей, где координаты (128,128) совпадают с верхним левым углом телеэкрана.  
Внутри консоли спрайты рендерятся в обратном порядке, т.е. сверху вниз, слева направо.  
Пример:  
![][image3]  
Для вывода спрайта на экран нам нужно использовать функции API:

* SegaGenesis.setPaletteColorsAtIndex(int index, short\[\] palette)  
  функция работает аналогично функции SegaGenesis.setPaletteColors(short\[\] palette), которая используется для загрузки палитры заднего фона, единственное отличие в том что можно задать индекс начала загрузки палитры. Значение индекса должно быть от 0 до 63, если передать индекс за пределы диапазона, то это может привести к непредвиденным последствиям.  
* SegaGenesis.setPatternTableAtIndex(int index, int\[\] patterns);  
  Функция работает аналогично функции SegaGenesis.setPatternTable(int\[\] pattern). Параметр index определяет адрес, с которого начинается загрузка тайлов в видеопамять(VDP). Не рекомендуется записывать в диапазон \[0x0460, 0x0479\], так как в эти адреса загружается шрифт и в диапазон \[0x0600, 0x071F\], так как там храняться данные тайловой карты.   
* SegaGenesis.setSpritePosition(int index, int x, int y);  
  Функция настраивает позицию спрайта по индексу спрайта из Sprite Attribute Table, не путать с индексом из функции setPatternTableAtIndex. Чтобы спрайт отобразился на экране, значения x и y должны быть в диапазоне x=(128, 448\) y=(128, 352).   
* SegaGenesis.setSpriteConfig1(int index, int value);  
  это так называемое первое слово конфигурации спрайта, в которое входит: горизонтальный размер спрайта в тайлах, вертикальный  размер спрайта в тайлах, индекс следующего спрайта который нужно отобразить.  
* SegaGenesis.setSpriteConfig2(int index, int value);

Второе слово в которое входит: номер палитры, отображение по горизонтали или вертикали(опционально), адрес спрайта в VDP.

Пример [кода](https://github.com/Mark65537/Empty-project-Java-Grinder/blob/master/res/sprites/SprArrow.java) спрайта компьютерной мыши.

4. ## **Управление** {#управление}

На данный момент реализовано только 3 кнопочное управление, без кнопки Mode. В API содержится метод для получения кода текущей нажатой кнопки(getJoypadValuePort1), и константы кодов кнопок.  
public static final int JOYPAD\_START \= 0x2000;  
public static final int JOYPAD\_A \= 0x1000;  
public static final int JOYPAD\_C \= 0x0020;  
public static final int JOYPAD\_B \= 0x0010;  
public static final int JOYPAD\_RIGHT \= 0x0008;  
public static final int JOYPAD\_LEFT \= 0x0004;  
public static final int JOYPAD\_DOWN \= 0x0002;  
public static final int JOYPAD\_UP \= 0x0001;  
Но если вы попробуете написать что то подобное, то это не будет работать:  
  int keyCode=SegaGenesis.getJoypadValuePort1();  
  if (keyCode \== JOYPAD\_A){  
    //Действия для кнопки А  
}  
На данный момент неизвестно, как автор планировал работу с джойстиком, поскольку в единственном демонстрационном примере для Sega отсутствует реализация работы с ним.  
Экспериментальным путем удалось определить истинные значения констант (если кто-то знает, почему используются именно эти значения, просьба написать в комментариях). Также выяснилось, что значения для каждой клавиши могут меняться со временем в диапазоне от 0x0000 до 0xF000 с шагом 0x0100. Кроме того, было установлено, что тип значений кнопок A и START — int(возможно short, но функция getJoypadValuePort1 возвращает int), а для остальных кнопок — byte. Это говорит о том, что значения кнопок могут изменяться и не являются константами. Учитывая данные особенности, для реализации управления можно использовать два метода:  
*Примечание: в данном коде не реализовано многокнопочное управление. Это означает, что за раз можно нажать только одну кнопку, и пока вы не отпустите предыдущую, следующую не будет прочитана.*  
1 метод. Использовать цикл для распознавания, текущей нажатой клавиши. За счет цикла данный метод работает медленнее, но из\-за этого в нем плавнее движение спрайта.  
\`\`\`java  
int keyCode \= SegaGenesis.getJoypadValuePort1();        
//проверка нажатий кнопок  
      if(\!pressed){  
        for (int i \= 0x0000; i \<= 0xF000; i\+=0x0100) {  
              // проверка нажатия кнопки вверх  
              if(keyCode \== (i\+0x0081) && y \> 0x7F) {                        
                  
                break;  
              }  
               
              // проверка нажатия кнопки вниз              
              if(keyCode \== (i\+0x0082) && y \< 0x160) {                        
                  
                break;  
              }  
               
              // проверка нажатия кнопки влево                      
              if(keyCode \== (i\+0x0084) && x \> 0x7E) {                        
                  
                break;                  
              }

              // проверка нажатия кнопки вправо            
              if(keyCode \== (i\+0x0088) && x \< 0x1C0) {                        
                  
                break;  
              }

              // проверка нажатия кнопки A          
              if(keyCode \== (i\+0xD080)) {

                pressed \= true;  
                break;  
              }

              // проверка нажатия кнопки B            
              if(keyCode \== (i\+0x0090)) {                  
                           
                pressed \= true;  
                break;  
              }

              // проверка нажатия кнопки C            
              if(keyCode \== (i\+0x00A0)) {                      

                pressed \= true;  
                break;  
              }

              // проверка нажатия кнопки START            
              if(keyCode \== (i\+0xE080)) {  
                  
                pressed \= true;  
                break;  
              }  
        }            
      }  
      else if(keyCode \== 0xCC80 || keyCode \== 0xC080) {  
        pressed \= false;  
      }  
\`\`\`

2 метод. В данном методе спрайт может перемещаться с максимальной скоростью, из\-за чего его может быть не видно и нужно делать задержку, используя функцию Timer.wait(int frames) или условия задержки по счетчику.  
int keyCode \= SegaGenesis.getJoypadValuePort1();  
       
      //проверка нажатий кнопок  
      if(\!pressed){  
        // проверка нажатия кнопки вверх 0x81  
        if((byte)keyCode \== \-127 && y \> 0x7F) {                      

          Timer.wait(1);  
        }

        // проверка нажатия кнопки вниз 0x82              
        if((byte)keyCode \== \-126 && y \< 0x160) {                      

          Timer.wait(1);  
        }  
               
        // проверка нажатия кнопки влево 0x84                    
        if((byte)keyCode \== \-124 && x \> 0x7E) {                      

          Timer.wait(1);                  
        }

        // проверка нажатия кнопки вправо 0x88          
        if((byte)keyCode \== \-120 && x \< 0x1C0) {                      

          Timer.wait(1);  
        }

        // проверка нажатия кнопки A 0xD080          
        if(keyCode \== 0xD080) {

          pressed \= true;  
        }

        // проверка нажатия кнопки B 0x90          
        if((byte)keyCode \== \-112) {  
                     
          pressed \= true;  
        }

        // // проверка нажатия кнопки C 0xA0          
        if((byte)keyCode \== \-96) {                        
            
          pressed \= true;  
        }

        // проверка нажатия кнопки START 0xE080          
        if(keyCode \== 0xE080) {  
            
          pressed \= true;  
        }  
      }  
      else if(keyCode \== 0xCC80 || keyCode \== 0xC080) {  
        pressed \= false;            
      }

5. ## **Звуки** {#звуки}

Для того чтобы проиграть хоть какую-нибудь мелодию на Sega Mega Drive, необходимо знать как работает звук на платформе. Вкратце, для воспроизведения звука на Sega используется: z80 CPU, z80 RAM, Yamaha 2612, PSG, Audio Mixer. Мы можем напрямую взаимодействовать только с z80 RAM, а он уже непосредственно будет управлять всем остальным. Примерная схема взаимодействия выглядит так:  
![][image4]

Начнем с подготовки файлов музыки и звуков. Музыкальный файл должен быть монофоническим, с глубиной звука 8 бит и, желательно, с частотой дискретизации 44100 Гц. Рекомендуется использовать файлы с расширением .wav, поскольку у данного формата вся необходимая информация содержится в заголовке, а данные хранятся в исходном(RAW) формате. Для удобства конвертирования вашего звукового файла под данные ограничения можете воспользоваться моей программой [z80GrinderConverter](https://github.com/Mark65537/z80GrinderConverter).   
Для работы с z80 используются API методы: 

* **loadZ80(byte\[\] code)**: Загружает код размером до 8 килобайт в Z80 RAM. Z80 будет сброшен через API, и загруженный код начнет выполняться.  
* **resetZ80()**: Сбрасывает состояние Z80, возвращая его к начальному состоянию.  
* **pauseZ80()**: Приостанавливает выполнение Z80. Это необходимо для того, чтобы главный процессор m68000 мог получить доступ к каким-либо ресурсам в пространстве Z80.  
* **startZ80()**: Запускает выполнение Z80 снова, после того как он был приостановлен или остановлен.

Есть 3 способа как проиграть мелодию: загрузить звук в z80 RAM плюс код инициализации, загрузить ноты и их последовательность в z80 RAM плюс код инициализации, загрузить данные из wav файла в ром и wav проигрыватель в z80 RAM и передать адрес начала в определенное смещение в z80 RAM. Разберем каждый способ по порядку

**Способ 1\. Загрузить звук с кодом инициализации в z80 RAM.**  
Для начала нам понадобиться код инициализации. Код инициализации это код на ассемблере z80, Который передается через процессор M68000 в z80 RAM как скомпилированный массив данных. Чтобы его получить вы можете скомпилировать файл [z80\_play\_dac.asm](https://github.com/mikeakohn/java_grinder/blob/master/samples/sega_genesis/z80_play_dac.asm) с помощью naked\_asm, перевести его в java байт массив и выделить из него код инициализации, или можете использовать готовый массив кода инициализации:  
  static byte loopDelay \= 62;//задержка. сколько раз будет выполнен цикл  
public static byte\[\] z80\_init\_code \=  
  {  
      62,   43,   50,    0,   64,   62, \-128,   50,  
       1,   64,  \-35,   33,   58,    0,   33,  112,  
      23,   62,   42,   50,    0,   64,  \-35,  126,  
       0,   50,    1,   64,  \-35,   35,    6,   loopDelay,  
      16,   \-2,   43,  125,   \-2,    0,   32,  \-23,  
     124,   \-2,    0,   32,  \-28,   62,   43,   50,  
       0,   64,   62,    0,   50,    1,   64,  \-61,  
      55,    0,  
}  
После вставки кода инициализации в z80 RAM свободного места у вас остается 512-58=454 байт, этого обычно достаточно для небольшого звукового эффекта, но не для проигрывания полной мелодии.

**Способ 2\. Записать ноты или мелодии и проигрывать их по заданному сценарию**  
Автор Java Grinder для реализации данного способа, использовал гитарные аккорды и проигрывал их в цикле по заданному порядку. Можете модифицировать данный [код](https://github.com/mikeakohn/java_grinder/blob/master/samples/sega_genesis/z80_play_title_song.asm) для создания своей собственной мелодии, после чего скомпилировать его с помощью naked\_asm и перевести в java байт массив. 

**Способ 3\. Написать свой проигрыватель или использовать уже готовый.**   
Для этого метода нужно: разместить код проигрывателя в z80 RAM, разместить музыкальные данные в ROM, определить адрес и длину музыкальных данных в ROM, записать адрес и длину в определенное место в z80 RAM.  
К сожалению тут мы сталкиваемся с одним из ограничений Java, максимальный размер статического массива не должен превышать 8 242 элементов. Мы можем преодолеть данное ограничение использовав вместо типа byte тип int(самый большой тип данных в Grinder на данный момент), тогда получаем что максимальный размер файла который можно загрузить в один массив равно 8 242 \* 4 \= 32968 байт или почти 33 Килобайт. Именно такой длины музыкальный файл мы можем загрузить без проблем в ROM, для его загрузки в память ROM, мы должны просто сослаться на него, например: byte\[\] b \= z80\_code или создать пустую функцию в файле, где у вас расположен массив z80\_code и просто вызвать ее, например: public static void init(){}. Если этого размера вам недостаточно, то придется создавать несколько массивов и вызывать их все по очереди в функции обертке. К сожалению, запись музыки в ROM один в один не получится, так как между массивами будет вставлено 4 байта, указывающие на размер массива.  
На данный момент нет примера пользовательского проигрывателя wav-файлов, а также нет мелодии, которую можно было бы воспроизвести с его помощью. 

6. ## **Вывод** {#вывод}

На текущий момент движок очень сырой и лучше всего подойдет для создания каких-нибудь живых книг или визуальных новелл, желательно без музыки или очень короткой, так как на нем очень просто отображать задний фон, но сложно портировать музыку. Для более сложных проектов, таких как платформеры, лучше использовать другие движки, например [SGDK](https://github.com/Stephane-D/SGDK) или [BasieGaxorz(BEX)](https://devster.monkeeh.com/sega/basiegaxorz/). Более полный список всех собранных движков можно посмотреть [здесь](https://github.com/And-0/awesome-megadrive).

7. ## **Демо** {#демо}

На данный момент существует всего два проекта для Sega Mega Drive сделанных на Java Grinder. 

1.  [sega\_genesis\_java\_demo.bin](https://www.mikekohn.net/micro/binaries/sega_genesis_java_demo.bin) \- это демо версия от разработчика для демонстрации возможности движка  
2. [Dr. Sukebe x-boobs](https://romhacking.ru/news/dr_sukebe_x_boobs_smd/2024-01-14-11750) \- это эротически-юморная игра которая является портом игры с j2me  
   

Возможно после ознакомления с данной статьей, увеличиться интерес к теме, и появятся новые проектные инициативы.

8. ## **Ограничения** {#ограничения}

Здесь собраны ограничения движка с которыми я столкнулся во время разработки.

1. Нельзя создавать объекты, ключевое слово new недоступно  
2. Нельзя оставлять пустое условие if.  
3. Нельзя присваивать enum начальное значение. Есть возможность создавать enum, но нельзя их использовать.  
4. Поля класса обязательно должны быть static final или без final, но тогда без инициализации.  
5. нельзя использовать адреса в VDP в диапазоне \[0x0460, 0x0479\], так как там находится шрифт;  
6. Команды SegaGenesis.setPalettePointer(17); SegaGenesis.setPaletteColor(0x000); не понятно зачем нужны. может быть не работают  
7. Максимальный размер статического массива не должен превышать 8 242 элементов.  
8. В шрифте доступны только большие английские буквы, БЕЗ ЦИФР И ЗНАКОВ ПРЕПИНАНИЯ.  
9. Поддерживаются только три типа чисел: byte, short, int.  
10. Нельзя инициализировать поле в методе  
11. Нельзя обратиться к элементу массива char\[\]. Например нельзя писать chr\_arr\[0\]  
12. Нельзя одновременно проигрывать музыку и звуковой эффект.  
13. Графика и музыка по умолчанию не шифруются, в отличии от SGDK. 

## **Советы**

1. если выдает ошибку Couldn't find “ИмяПоля”  
   \*\* Error setting statics ../common/JavaCompiler.cxx:2416. попробуйте сделать поле final.  
2. Если не удается скомпилировать проект, хотя до этого он компилировался, попробуйте удалить все .class файлы.

## **Планы на будущее**

1. Добавить полный шрифт со знаками препинания и кириллицей  
2. Добавить возможность загрузки bin файлов. Такая возможность есть в движке, но для других консолей, не для sega mega drive.

## **Ссылки**

1. [https://habr.com/ru/articles/471914/](https://habr.com/ru/articles/471914/)  
2. [https://www.copetti.org/ru/writings/consoles/mega-drive-genesis/](https://www.copetti.org/ru/writings/consoles/mega-drive-genesis/)  
3. [https://megacatstudios.com/ru/blogs/retro-development/sega-genesis-mega-drive-vdp-graphics-guide-v1-2a-03-14-17](https://megacatstudios.com/ru/blogs/retro-development/sega-genesis-mega-drive-vdp-graphics-guide-v1-2a-03-14-17)  
4. [Не вошедшее](https://github.com/Mark65537/Java-for-sega-genesis/blob/main/not_included.md)
