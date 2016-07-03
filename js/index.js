'use strict';
(function(){
  /*
  * Формат входных/выходных данных: массив объектов типа {from: 'string value', to: 'string value', ....}
  */
  var cards = [{from: 'Krasnodar', to: 'Rostov-na-Donu', vehicle: 'train', flight_number: '45A', place_number: '26', baggage_number: ''},
              {from: 'Voronezh', to: 'Kursk', vehicle: 'bus', flight_number: '41', place_number: '', baggage_number: ''},
              {from: 'Kursk', to: 'Oryol', vehicle: 'bus', flight_number: '102', place_number: '', baggage_number: ''},
              {from: 'Simferopol', to: 'Krasnodar', vehicle: 'plan', flight_number: '98H', place_number: '54A', baggage_number: '254'},
              {from: 'Rostov-na-Donu', to: 'Voronezh', vehicle: 'plan', flight_number: '10', place_number: '30B', baggage_number: '45', field: 'example'},
              {from: 'Tula', to: 'Moscow', vehicle: 'bus', flight_number: '36', place_number: '', baggage_number: ''},
              {from: 'Oryol', to: 'Tula', vehicle: 'train', flight_number: '123', place_number: '17', baggage_number: '', field: 'example', another_field: 'example'}];
  /**
  * Строим план при запуске
  */
  build(cards);
  /**
  * Обработчик события нажатия кнопки 'Open file'
  * Имитируем нажатие инпута типа 'file'
  */
  document.getElementById('file-btn').addEventListener('click', (e) => {
    document.getElementById('file-input').dispatchEvent(new Event('click'));
  }, false);
  /**
  * Обработчик события выбора файла
  * Считываем информацию из файла типа JSON, парсим, сортируем и строим план поезки
  */
  document.getElementById('file-input').addEventListener('change', (e) => {
    let file = e.target.files[0],
        reader = new FileReader();
    if (!file) return;
    reader.onload = (e) => {
      let contents = e.target.result,
          cards = JSON.parse(contents);
      build(cards);
    };
    reader.readAsText(file);
  }, false);
  /**
  * Сортируем массив карточек и строим план поезки. Выводим информацию на экран
  * @param {Array} cards несортированный список карточек
  */
  function build(cards){
    let ol = document.getElementById('list'),
        gen,
        li;
    try{
      while (ol.firstChild) { ol.removeChild(ol.firstChild); }  // Очистка списка для повторного употребления
      cards.sort = sort; // Назначение метода сорт массиву карточек
      cards.sort().forEach((card) => { //Сортировка и последующий перебор массива для построения DOM модели
        gen = generator(card);
        li = document.createElement('li');
        li.appendChild(document.createTextNode(gen.next().value)); //Генерация словесного описания
        li.appendChild(document.createTextNode(gen.next().value));
        li.appendChild(document.createTextNode(gen.next().value));
        li.appendChild(document.createTextNode(gen.next().value));
        ol.appendChild(li);
      });
    }
    catch(err){ alert(err); }
  }
  /**
  * Генератор возвращает словесное описание, как проделать ваше путешествие
  * @param {Object} card карточка содержащая информацию о том, откуда и куда вы едете на данном отрезке маршрута, а также о типе транспорта и т.д.
  * @returns {String} Возвращает строки, описывающие маршрут
  */
  function* generator(card){
    let phrase = '',
        phrases = [
          `Take ${card.vehicle} ${card.flight_number} from ${card.from} to ${card.to}. `,
          `From ${card.from}, take ${card.vehicle} ${card.flight_number} to ${card.to}. `,
          `Take ${card.vehicle} ${card.from} -- ${card.to}. Flight number ${card.flight_number}. `
        ],
        rand = function(min, max){
          return Math.floor((Math.random() * max) + min);
        };
    yield phrases[rand(0, phrases.length)];
    phrases = [
      `Seat ${card.place_number}. `,
      `Seat №${card.place_number}. `,
      `Take sit number ${card.place_number}. `
    ];
    yield card.place_number? phrases[rand(0, phrases.length)] : `No seat assignment. `;
    yield card.baggage_number? `Baggage drop at ticket counter ${card.baggage_number}. ` : `Baggage will be automatically transferred from your last leg. `;
    for(let attr in card){  //Если есть не стандартные поля выводим их в виде 'свойство: значения'
      if(attr.match(/from|to|vehicle|flight_number|place_number|baggage_number/i)) continue;  //Пропускаем уже описанные свойства
      if(!card[attr].length) { phrase += `No info about ${attr}. `; continue; }
      let str = attr.split(/[^A-Za-z0-9]+/ig).join(' ');
      str = str.charAt(0).toUpperCase() + str.substr(1);
      phrase += `${str}: ${card[attr]}. `;
    }
    yield phrase.length? phrase : '';
  }
  /**
  * Функция сортировки карточек
  * @returns {Array} Возвращает отсортированный массив карточек
  */
  function sort(){
    let tmp, res, srt;
    if(!Array.isArray(this)) { throw new Error('Not Array'); }
    if(!this.length) return [];
    tmp = this.slice();  //Копируем исходный массив
    res = [];
    srt = function(left, right){
      let next_left,
          next_right,
          left_index = 0,
          right_index = 0;
      if(!res.length) {  //Если результирующий массив пуст т.е. функция вызвана впервые
        left_index = tmp.indexOf(left);
        res.push(left);   //Записываем значение аргумента в рез. массив
        tmp.splice(left_index, 1);  //Удаляем элемент из временного массива
      }
      for(let i = 0; i < tmp.length; i++){
        if(left && (left.to.toLowerCase() == tmp[i].from.toLowerCase())) { next_left = tmp[i]; left_index = i; }  //Ищем совпадения слева
        if(right && (right.from.toLowerCase() == tmp[i].to.toLowerCase())) { next_right = tmp[i]; right_index = i; } //Ищем совпаденя справа
        if(next_left && next_right) break;
      }
      if(next_left) { tmp.splice(left_index, 1); res.push(next_left); } //Если найдены совпадения слева пушим их в рез. массив и удаляем найденное значение из временного
      if(next_right) {  //Если найдены совпадения справа вставляем их в начало рез. массив и удаляем найденное значение из временного
        if(next_left && (left_index < right_index)) { right_index--; }  //Если мы нашли совпадение слева и удалили элемент из массива уменьшаем правый индекс
        tmp.splice(right_index, 1);
        res.unshift(next_right);
      }
      if(next_left || next_right) { return srt(next_left, next_right); } //Если совпадения есть рекурсивно вызываем функцию сортировки
      else return;  //Иначе выходим
    }
    srt(tmp[0], tmp[0]);  //Вызов функции сортировки
    if(tmp.length) { throw new Error('Do not form a single unbroken chain'); }
    return res;
  }
})();
