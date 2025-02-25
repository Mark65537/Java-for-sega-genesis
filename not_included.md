# Графика

## Палитра

Если вы использеуте меньше цветов в палитре чем 16, то необязательно добавлять все цвета в массив public static short[] palette, можно просто написать 
```java
  public static short[] palette =
  {
    0xeee, 0x0,
  };
```

## **Управление**

На данный момент реализовано только 3 кнопочное управление, без кнопки Mode. В API содержится метод для получения кода текущей нажатой кнопки `SegaGenesis.getJoypadValuePort1`, и константы кодов кнопок. 

```java 
public static final int JOYPAD_START = 0x2000;  
public static final int JOYPAD_A = 0x1000;  
public static final int JOYPAD_C = 0x0020;  
public static final int JOYPAD_B = 0x0010;  
public static final int JOYPAD_RIGHT = 0x0008;  
public static final int JOYPAD_LEFT = 0x0004;  
public static final int JOYPAD_DOWN = 0x0002;  
public static final int JOYPAD_UP = 0x0001;
```
  
Но если вы попробуете написать что то подобное, то это не будет работать: 
 
```java
  int keyCode=SegaGenesis.getJoypadValuePort1();  
  if (keyCode == JOYPAD_A){  
    //Действия для кнопки А  
}  
```

Однако, как показывает практика, такой подход не работает. Причина кроется в том, что метод getJoypadValuePort1 возвращает не просто код кнопки, а битовую маску, в которой могут быть установлены несколько битов одновременно.

На данный момент неизвестно, как автор планировал работу с джойстиком, поскольку в единственном демонстрационном примере для Sega отсутствует реализация работы с ним.  
Экспериментальным путем удалось определить истинные значения констант, если кто-то знает, почему используются именно эти значения, просьба написать в комментариях. Также выяснилось, что значения для каждой клавиши могут меняться со временем в диапазоне от 0x0000 до 0xF000 с шагом 0x0100. Кроме того, было установлено, что тип значений кнопок A и START — int(возможно short, но функция `SegaGenesisgetJoypadValuePort1` возвращает int), а для остальных кнопок — byte. Это говорит о том, что значения кнопок могут изменяться и не являются константами. Учитывая данные особенности, для реализации управления можно использовать два метода: 
 
*Примечание: в данном коде не реализовано многокнопочное управление. Это означает, что за раз можно нажать только одну кнопку, и пока вы не отпустите предыдущую, следующую не будет прочитана.*  

**1 метод.** Использовать цикл для распознавания, текущей нажатой клавиши. За счет цикла данный метод работает медленнее, но из-за этого в нем плавнее движение спрайта.  

```java  
int keyCode = SegaGenesis.getJoypadValuePort1();        
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
```

**2 метод.** В данном методе спрайт может перемещаться с максимальной скоростью, из-за чего его может быть не видно и нужно делать задержку, используя функцию `Timer.wait(int frames)` или условия задержки по счетчику.

```java  
int keyCode = SegaGenesis.getJoypadValuePort1();  
       
      //проверка нажатий кнопок  
      if(!pressed){  
        // проверка нажатия кнопки вверх 0x81  
        if((byte)keyCode == -127 && y > 0x7F) {                      

          Timer.wait(1);  
        }

        // проверка нажатия кнопки вниз 0x82              
        if((byte)keyCode == -126 && y < 0x160) {                      

          Timer.wait(1);  
        }  
               
        // проверка нажатия кнопки влево 0x84                    
        if((byte)keyCode == -124 && x > 0x7E) {                      

          Timer.wait(1);                  
        }

        // проверка нажатия кнопки вправо 0x88          
        if((byte)keyCode == -120 && x < 0x1C0) {                      

          Timer.wait(1);  
        }

        // проверка нажатия кнопки A 0xD080          
        if(keyCode == 0xD080) {

          pressed = true;  
        }

        // проверка нажатия кнопки B 0x90          
        if((byte)keyCode == -112) {  
                     
          pressed = true;  
        }

        // // проверка нажатия кнопки C 0xA0          
        if((byte)keyCode == -96) {                        
            
          pressed = true;  
        }

        // проверка нажатия кнопки START 0xE080          
        if(keyCode == 0xE080) {  
            
          pressed = true;  
        }  
      }  
      else if(keyCode == 0xCC80 || keyCode == 0xC080) {  
        pressed = false;            
      }
```

# Музыка

У Yamaha YM2612 дополнительно есть 2 режима: LFO(Low-frequency oscillation), DAC(Digital to Analog Converter). первый используется 


Максимальный размер звука который вы можете загрузить в Z80 это 8 Кб(написать точное значение в байтах) минус несколько байт на код воспроизведения и того получается чуть меньше 8 Кб, этого конечно же недостаточно для полноценной музыки. Есть 3 способа как воспроизвести звук: DAC(Digital to Analog Converter), Yamaha 2612, PSG(Programmable Sound Generator). Мы будем использовать DAC, так как PSG в основном используется для белого шума, а как загрузить музыку в Yamaha 2612 я так и не разобрался. Для того чтобы загрузить музыку которая больше 8Кб нам нужно будет загружать ее частично в Z80 и подать в него в оффсет … абсолютный адрес начала данных музыки в роме(Данный метод был взят из движка GINCS с которым я работал до этого). Для этого нам нужно сначала загрузить музыку в ром, потом найти абсолютный адрес начала музыки в роме и после записать код в Z80 с помощью функции loadZ80(byte[] code) с адресом вставленным в оффсет …
Для того чтобы записать данные музыки в ром нам сначала нужно подготовить файл который будет звучать в нашей игре. Файл должен быть в формате .wav(с другими не экспериментировал, скорей всего тоже получиться), с частотой 8-bit, в моно формате, с   определенным количеством герц, герцы подбирать не обязательно, это нужно для того что бы музыка звучала одинаково как на компьютере, так и на железе. После того как подготовили файл нужно вытащить из него данные в raw формате, для этого можете воспользоваться скриптом или найти другой способ. Далее эти данные нужно преобразовать в Java массив byte[], он отличается от массива байт на других языках. Значение массива byte должно быть от 0 до -1, причем если значение будет больше 127, то значение байт будет -128, также не желательно писать байты в 16-ричном формате, так как в Java тип hex значений числа после 0x79 будут int, и нужно будет приводить каждое значение к типу byte.

При использовании GINCS проигрывателя, записать адрес в оффсет в обратном порядке 0x3A-0x3C и длину в оффсет 0x3D-0x3F в z80 RAM

# Код

Минимальная программа hello world выглядет вот так

```java
import net.mikekohn.java_grinder.SegaGenesis;

public class Main
{  
  static public void main(String[] args)
  {                                              
    // Set Font.
    SegaGenesis.loadFonts();
    SegaGenesis.setPaletteColors(palette);

    SegaGenesis.setCursor(128, 128);
    SegaGenesis.print("HELLO WORLD");  
  }
  
  public static short[] palette =
  {
    0xeee, 0x0,
  };
} 
```

если поместить palette в функцию main то скомпилированный файл будет весить больше с 06C1 в 06E9
