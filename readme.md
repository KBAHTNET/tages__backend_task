# Работа с проектом

Для запуска генератора файла
```
npm run generate
```

Для запуска сортировки файла
```
npm run sort
```

Размер генерируемого файла и максимальный объем используемой памяти, а также другие настройки можно поменять в файле ./FileGeneration/generateConfig.js

___

# Описание проекта

В данном проекте присутсвует генерация файла со строками различными способами:
- Генерация в 1 потоке
    - генерация с использованием оперативной памяти равной размеру генерируемого файла, то есть если генерируется файл в размером 1ТБ, то понадобится 1ТБ оперативной памяти
    - генерация с использованием оперативной памяти равной размеру максимально допустимого объема используемой памяти (задается в настройках к генерации файла (./FileGeneration/generateConfig.js) - maxMemoryUse) [является наиболее быстрым и предпочтительным]
    - генерация с использованием оперативной памяти равной размеру генерируемой строки [самая маленькая скорость, из-за постоянно создающегося дескриптора файла]
- Мультипоточная генерация с использованием "worker_theads"
    - Каждый Worker занимается лишь генерацией строки и записью в файл с использование 1 дескриптора [самый наихудший подход]
    - Каждый Worker занимается генерацией строки, создает дескриптор файла на дозапись и непосредственно записывает

Для задачи сортировки выбран алгоритм сортировки слиянием. Настройки сортировки указываются в файле (./FileSort/mergeConfig.js). Подход следующий:

1. Для начала необходимо прочитать весь файл таким образом, чтобы мы знали лишь первый символ строки и через сколько находится сплиттер (разделитель строки - в большинстве случаев это '\n') этой строки. Данный подход можно реализовывать чтениями чанками (частями) фиксированного размера, во избежании выхода за пределы предоставленной оперативной памяти. К концу чтения файла формируется массив, по длине равный количеству строк в файле с объектом (считаем, что поместить полностью данный массив в оперативную память мы можем):
```ts
interface StrObject {
  start: number, //смещение в файле, указывающее на начало строки
  end: number, //смещение в файле, указывающее на конец строки
  strNumber: number, //номер строки в файле
  symbolsToSort: string, //символы для сортировки - добавляются динамически, нужны для сравнения 2-х объектов, если текущие символы совпадают, то читается следующий символ, пока не будет различия (с учетом длины строки)
}
```
2. Сортируем полученный в п.1 массив, где индекс объекта, указывает на номер строки в отсортированном файле.
3. Итерируемся по отсортированному массиву, читаем строку из первоначального файла (начала и конец строки у нас есть) и записываем в новый файл (если брать ограничения по памяти, то необходимо вставить пункт с удалением прочитанной строки, и учесть смещения для каждого объекта, строки которого находятся ниже текущего прочитанного).

