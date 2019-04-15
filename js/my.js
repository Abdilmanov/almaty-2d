      function changeContent(value) {
          var content;
              switch(value) {
              case "1":  
              content="небольшой тяжести";
              break;
              case "2":  
              content="средней тяжести";
              break;
              case "3":  
              content="тяжкие";
              break;
              case "4":  
              content="особо тяжкие";
              break;
              case "5":  
              content="преступления";
              break;
              case "6":  
              content="проступки";
              break;
              default:
              content="Не определена";
              break;
          }
          return content;
        }
 
function descstat(value) {

       var content;
       switch(value) {
        case "0990" :  content="Убийство"; break;
        case "1000" :  content="Убийство матерью новорожденного ребенка"; break;
        case "1010" :  content="Убийство, совершенное в состоянии аффекта"; break;
        case "1020" :  content="Убийство, совершенное при превышении пределов необходимой обороны"; break;
        case "1030" :  content="Убийство, совершенное при превышении мер, необходимых для задержания лица, совершившего преступление"; break;
        case "1040" :  content="Причинение смерти по неосторожности"; break;
        case "1050" :  content="Доведение до самоубийства"; break;
        case "1060" :  content="Умышленное причинение тяжкого вреда здоровью"; break;
        case "1070" :  content="Умышленное причинение средней тяжести вреда здоровью"; break;
        case "1080" :  content="Умышленное причинение легкого вреда здоровью"; break;
        case "1110" :  content="Причинение вреда здоровью в состоянии аффекта"; break;
        case "1120" :  content="Причинение тяжкого вреда здоровью при превышении пределов необходимой обороны"; break;
        case "1130" :  content="Причинение тяжкого вреда здоровью при задержании лица, совершившего преступление"; break;
        case "1140" :  content="Неосторожное причинение вреда здоровью"; break;
        case "1190" :  content="Оставление в опасности"; break;
        case "1200" :  content="Изнасилование"; break;
        case "1210" :  content="Насильственные действия сексуального характера"; break;
        case "1460" :  content="Пытки"; break;
        case "1490" :  content="Нарушение неприкосновенности жилища"; break;
        case "1870" :  content="Мелкое хищение"; break;
        case "1880" :  content="Кража"; break;
        case "1900" :  content="Мошенничество"; break;
        case "1910" :  content="Грабеж"; break;
        case "1920" :  content="Разбой"; break;
        case "1923" :  content="Хищение предметов, имеющих особую ценность"; break;
        case "2870" :  content="Незаконные хранение оружия, боеприпасов, взрывчатых веществ и взрывных устройств"; break;
        case "2880" :  content="Незаконное изготовление оружия"; break;
        case "2910" :  content="Хищение либо вымогательство оружия, боеприпасов, взрывчатых веществ и взрывных устройств"; break;
        case "2920" :  content="Нарушение требований пожарной безопасности"; break;
        case "2930" :  content="Хулиганство"; break;
        case "2940" :  content="Вандализм"; break;
        case "2970" :  content="Незаконные изготовление, переработка, приобретение, хранение, перевозка в целях сбыта"; break;
        case "3000" :  content="Незаконное культивирование запрещенных к возделыванию растений, содержащих наркотические вещества"; break;
        case "3020" :  content="Организация или содержание притонов для потребления наркотических средств, психотропных веществ"; break;
        case "3070" :  content="Организация незаконного игорного бизнеса"; break;
        case "3090" :  content="Организация или содержание притонов для занятия проституцией и сводничество"; break;
        case "3100" :  content="Организация или содержание притонов для одурманивания с использованием лекарственных или других средств"; break;
        case "3140" :  content="Надругательство над телами умерших и местами их захоронения"; break;
   }
   return content;
   }
   
    var popupTemplate = { 
        title: "  {CRIME_CODE}", 
        content: [{type: 'fields',

          fieldInfos: [{
            fieldName: "UD",
            label: "Номер регистрации в ЕРДР",
            format: {
              places: 0,
              digitSeperator: true
            }
          }, 
          {
            fieldName: "STAT",
            label: "Статья УК РК",
            format: {
              places: 0,
              digitSeperator: true
            }
          }, 
           {
            fieldName: "HARD_CODE",
            label: "Категория преступления",
            format: {
              places: 0,
              digitSeperator: true
            }
          },
          {
            fieldName: "ORGAN",
            label: "Орган регистрации",
            format: {
              places: 0,
              digitSeperator: true
            }
          }, {
            fieldName: "DAT_SOVER_STR",
            label: "Дата совершения",
            format: {
              places: 0,
              digitSeperator: true
            }
          }, {
            fieldName: "FZ1R18P5",
            label: "Улица",
            format: {
              places: 0,
              digitSeperator: true
            }
          }, {
            fieldName: "FZ1R18P6",
            label: "Дом",
            format: {
              places: 0,
              digitSeperator: true
            }
          }]
        }]
        
      };
	  
	function MyDate(dateIn) {
           var yyyy = dateIn.getFullYear();
           var mm = dateIn.getMonth()+1; 
		   if (mm.length=1) { mm="0"+mm};
           var dd  = dateIn.getDate();
           return String(yyyy+"-" + mm +"-"+ dd+" 00:00:00"); 
        }  
		//DAT_SOVER>= TIMESTAMP '2019-02-01 00:00:00' AND DAT_SOVER<= TIMESTAMP '2019-02-14 23:59:59'
		
	function SetStartDate(theDate, days) {
            return new Date(theDate.getTime() - days*24*60*60*1000);
            }
	