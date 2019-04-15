require([
  "esri/renderers/HeatmapRenderer",
  "esri/symbols/PictureMarkerSymbol",
  "esri/geometry/SpatialReference",
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query",
  "esri/widgets/LayerList",
  "esri/widgets/ScaleBar",
  "esri/tasks/IdentifyTask",
  "esri/tasks/support/IdentifyParameters",
  "esri/layers/FeatureLayer",
  "esri/widgets/Locate",
  "esri/widgets/Home",
  "esri/widgets/Fullscreen",
  // "esri/widgets/Track",
  "esri/core/urlUtils",
  "esri/widgets/Directions",
  "esri/widgets/BasemapGallery",
  "esri/widgets/Search",
  "esri/widgets/CoordinateConversion",
  "esri/layers/GraphicsLayer",
  // "esri/widgets/Sketch",
  "esri/layers/TileLayer",
  "esri/Basemap",
  // "esri/tasks/Locator",
  "esri/widgets/DistanceMeasurement2D",
  "esri/widgets/AreaMeasurement2D",
  "esri/views/MapView",
  "esri/WebMap",
  "esri/Map",
  "esri/config"
], function(
  HeatmapRenderer, PictureMarkerSymbol, SpatialReference, QueryTask, Query, LayerList, ScaleBar, IdentifyTask,
  IdentifyParameters, FeatureLayer, Locate, Home, Fullscreen, urlUtils, Directions, BasemapGallery, Search,
  CoordinateConversion, GraphicsLayer, TileLayer, Basemap, DistanceMeasurement2D, AreaMeasurement2D, MapView, WebMap,
  Map, esriConfig
){

  var identifyTask, identifyParams, tileLayer, myBasemap, map, view, ccWidget, searchWidget, basemapGallery,
    fullscreen, locateBtn, home, basemaps, map1, featureLayer, resultsLayer, start_day, end_day, simpleRenderer,
    heatmapRenderer, hard_active, hard_count, dayCount, periodCount, periods_active, heatmapLayer, where;
  var activeWidget = null, crime_period_hidden = true, crime_hard_hidden = true, query_data_panel = true;
  var pravstatUrl = "http://infopublic.pravstat.kz:8399/arcgis/rest/services/stat/MapServer/5";
  var gisBasemapUrl = "https://gis.uaig.kz/server/rest/services/BaseMapAlm_MIL1/MapServer";

  // Вытаскиваем слой Базовая_карта_MIL1
  tileLayer = new TileLayer({
    url: gisBasemapUrl,
    title: "Базовая карта Алматы"
  });

  featureLayer = new FeatureLayer({
    url: pravstatUrl,
  })

  heatmapLayer = new FeatureLayer({
    url: pravstatUrl,
    geometryType: "point",
    visible: false,
    title: "Тепловая карта преступности"
  });
  // console.log(fL);
  // Вывод графических слоев
  resultsLayer = new GraphicsLayer({
    visible: false,
    title: "Карта преступности"
  });
  // view.map.add(resultsLayer);

  basemaps = ["satellite","hybrid","streets","topo","dark-gray","gray",
   "national-geographic","terrain","oceans","osm"];

  // esriConfig.portalUrl = "https://gis.uaig.kz/arcgis/sharing/rest/content/items";
  // map = new WebMap({
  //   portalItem: {
  //     id: "b5a3c97bd18442c1949ba5aefc4c1835"
  //   }
  // });

  // Создание карты Базовая_карта_MIL1
  map = new Map({
    layers: [tileLayer, resultsLayer, heatmapLayer],
    basemap: null
  });

  // Создание MapView
  view = new MapView({
    container: "viewDiv",  // Reference to the scene div created in step 5
    map: map,  // Reference to the map object created before the scene
    zoom: 1,  // Sets zoom level based on level of detail (LOD)
    center: [76.92861, 43.25667]  // Sets center point of view using longitude,latitude
  });


  view.when(function(){

    document.getElementById('main_loading').style.display = 'none';

    view.ui.add("topRight", "top-right");
    view.ui.add("topLeft", "top-left");

    // Добавление на карту Кординаты
    ccWidget = new CoordinateConversion({
      view: view
    });
    view.ui.add(ccWidget, "bottom-left");

    // Добавление на карту Поиск
    searchWidget = new Search({
      view: view,
      allPlaceholder: "Кадастровый номер или здание",
      includeDefaultSources: false,
      sources: [{
        featureLayer: {
          url: "https://gis.uaig.kz/server/rest/services/Map2d/объекты_города3/MapServer/20",
          popupTemplate:{
            title: "Кадастровый номер",
            overwriteActions: true,
            content:[{
              type: "fields",
              fieldInfos:[{
                fieldName: "kad_n",
                label: "Кадастровый номер:",
                visible: true
              },{
                fieldName: "coder",
                label: "Код района:",
                visible: true
              },{
                fieldName: "adress",
                label: "Адрес:",
                visible: true
              },{
                fieldName: "funk",
                label: "Целевое назначение:",
                visible: true
              },{
                fieldName: "s",
                label: "Площадь зу:",
                visible: true
              },{
                fieldName: "right_",
                label: "Право:",
                visible: true
              }]
            }]
          }
        },
        searchFields: ["kad_n"],
        displayField: "kad_n",
        exactMatch: false,
        outFields: ["*"],
        name: "Кадастровый номер",
        placeholder: "Введите кадастровый номер",
        autoNavigate: true
      },{
        featureLayer: {
          url: "https://gis.uaig.kz/server/rest/services/Map2d/объекты_города3/MapServer/14",
          popupTemplate:{
            title: "Здания и сооружения",
            overwriteActions: true,
            content:[{
              type: "fields",
              fieldInfos:[{
                fieldName: "id_adr_massive",
                label: "Адресный массив:",
                visible: true,
              },{
                fieldName: "floor",
                label: "Количество этажей:",
                visible: true
              },{
                fieldName: "year_of_foundation",
                label: "Год постройки:",
                visible: true
              },{
                fieldName: "obsch_area",
                label: "Общая площадь:",
                visible: true
              },{
                fieldName: "volume_build",
                label: "Объем здания, м3:",
                visible: true
              },{
                fieldName: "zhil_area",
                label: "Площадь жил. помещения:",
                visible: true
              },{
                fieldName: "zastr_area",
                label: "Площадь застройки, м2:",
                visible: true
              },{
                fieldName: "street_name_1",
                label: "Наименование первичной улицы:",
                visible: true
              },{
                fieldName: "number_1",
                label: "Основной номер дома:",
                visible: true
              }]
            }]
          }
        },
        searchFields: ["street_name_1"],
        displayField: "street_name_1",
        exactMatch: false,
        outFields: ["*"],
        name: "Здание и сооружение",
        placeholder: "Пример: Ауэзова",
        // zoomScale: 500000,
        autoNavigate: true
      }]
    }, "search");

    // view.on("click", executeIdentifyTask);
    // create identify tasks and setup parameters
    // identifyTask = new IdentifyTask('https://gis.uaig.kz/server/rest/services/Map2d/объекты_города3/MapServer');
    //
    // params = new IdentifyParameters();
    // params.tolerance = 3;
    // params.returnGeometry = true;
    // params.layerIds = [14];
    // params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
    // // params.layerOption = "top";
    // params.width = view.width;
    // params.height = view.height;

    // Базовые карты для map1
    document.getElementById("almaty2d").addEventListener("click",
      function () {
        map.basemap = null;
      }
    )
    document.getElementById("satellite").addEventListener("click",
      function () {
        map.basemap = basemaps[0];
      }
    )
    document.getElementById("hybrid").addEventListener("click",
      function () {
        map.basemap = basemaps[1];
      }
    )
    document.getElementById("streets").addEventListener("click",
      function () {
        map.basemap = basemaps[2];
      }
    )
    document.getElementById("topo").addEventListener("click",
      function () {
        map.basemap = basemaps[3];
      }
    )
    document.getElementById("dark-gray").addEventListener("click",
      function () {
        map.basemap = basemaps[4];
      }
    )
    document.getElementById("gray").addEventListener("click",
      function () {
        map.basemap = basemaps[5];
      }
    )
    document.getElementById("national-geographic").addEventListener("click",
      function () {
        map.basemap = basemaps[6];
      }
    )
    document.getElementById("terrain").addEventListener("click",
      function () {
        map.basemap = basemaps[7];
      }
    )
    document.getElementById("oceans").addEventListener("click",
      function () {
        map.basemap = basemaps[8];
      }
    )
    document.getElementById("osm").addEventListener("click",
      function () {
        map.basemap = basemaps[9];
      }
    )

    // Вывод Слоев
    var layerList = new LayerList({
      view: view,
      listItemCreatedFunction: function(event) {
        const item = event.item;
        // if (item.layer.title == "Объекты города" || item.layer.title == "Криминальные происшествия в 2018 году"
        //  || item.layer.title == "Тепловая карта криминогенной обстановки в 2018 году" ) { // don't show legend twice
        if(item.layer.allSublayers || item.layer.title == "Криминальные происшествия в 2018 году"
         || item.layer.title == "Тепловая карта криминогенной обстановки в 2018 году")
        {
          if(item.layer.title == "Тепловая карта криминогенной обстановки в 2018 году"){
            item.layer.legendEnabled = true;
          }
          item.panel = {
            content: "legend",
            open: false
          };
          item.actionsSections = [
            [{
              title: "Информация о слое",
              className: "esri-icon-description",
              id: "information"
            },
            {
              title: "Уменьшить прозрачность",
              className: "esri-icon-up",
              id: "increase-opacity"
            }, {
              title: "Увеличить прозрачность",
              className: "esri-icon-down",
              id: "decrease-opacity"
            }]
          ];
        }else {

          item.actionsSections = [
            [{
              title: "Информация о слое",
              className: "esri-icon-description",
              id: "information"
            }]
          ];
        }

      }

    }, "layer_content");

    // При нажатии на кнопки в LayerList
    layerList.on("trigger-action", function(event)
    {
      // Capture the action id.
      var id = event.action.id;

      if (id === "information") {

        // if the information action is triggered, then
        // open the item details page of the service layer
        window.open(event.item.layer.url);

      } else if (id === "increase-opacity") {

        // if the increase-opacity action is triggered, then
        // increase the opacity of the GroupLayer by 0.25

        if (event.item.layer.opacity < 1) {
          event.item.layer.opacity += 0.25;
        }
      } else if (id === "decrease-opacity") {

        // if the decrease-opacity action is triggered, then
        // decrease the opacity of the GroupLayer by 0.25

        if (event.item.layer.opacity > 0.25) {
          event.item.layer.opacity -= 0.25;
        }
      }
    });

    // Масштабная линейка
    var scalebar = new ScaleBar({
      view: view,
      style: "ruler"
    });
    view.ui.add(scalebar, "bottom-left");

    // На полный экран
    var fullscreen = new Fullscreen({
      view: view
    });
    view.ui.add(fullscreen, "top-right");

    // Найти Местоположение
    var locateBtn = new Locate({
      view: view
    }, "locate_button");

    // В center карты
    var home = new Home({
      view: view
    });
    view.ui.add(home, "top-right");

    heatmapRenderer = {
      type: "heatmap",
      colorStops: [
        {
          color: "rgba(63, 40, 102, 0)",
          ratio: 0
        },
        {
          color: "#5EFF0A",
          ratio: 0.083
        },
        {
          color: "#74FF0A",
          ratio: 0.166
        },
        {
          color: "#9EFF0A",
          ratio: 0.249
        },
        {
          color: "#C4FF0A",
          ratio: 0.332
        },
        {
          color: "#DAFF0A",
          ratio: 0.415
        },
        {
          color: "#FFFF0A",
          ratio: 0.498
        },
        {
          color: "#FFE40A",
          ratio: 0.581
        },
        {
          color: "#FFB60A",
          ratio: 0.664
        },
        {
          color: "#FF910A",
          ratio: 0.747
        },
        {
          color: "#FF630A",
          ratio: 0.830
        },
        {
          color: "#FF3B0A",
          ratio: 0.913
        },
        {
          color: "#FF0A0A",
          ratio: 1
        }],
      maxPixelIntensity: 25,
      minPixelIntensity: 0
    };
    heatmapLayer.renderer = heatmapRenderer;
    doQuery()
      .then(getResults)
      .catch(promiseRejected);

    view.watch("scale", function(newValue) {
      view.map.layers.getItemAt(2).visible = newValue <= 60000 ? false : true;
      view.map.layers.getItemAt(1).visible = newValue <= 60000 ? true : false;
    });

  },function(error){

  });


  /*************Виджеты***************/

  // При нажатии кнопки "Запросить"
  document.getElementById('query_button1').addEventListener("click",
    function () {
      doQuery()
      .then(getResults)
      .catch(promiseRejected);
      crime_period_hidden = true;
  });
  document.getElementById('query_button2').addEventListener("click",
    function () {
      doQuery()
      .then(getResults)
      .catch(promiseRejected);
      crime_hard_hidden = true;
  });

  //Расстояние между 2-мя точками
  document.getElementById("distanceButton").addEventListener("click",
    function () {
      setActiveWidget(null);
      if (!this.classList.contains('active')) {
        setActiveWidget('distance');
      } else {
        setActiveButton(null);
      }
    });

  // Площадь
  document.getElementById("areaButton").addEventListener("click",
    function () {
      setActiveWidget(null);
      if (!this.classList.contains('active')) {
        setActiveWidget('area');
      } else {
        setActiveButton(null);
      }
    });

  // не показывать окно с Базовыми картами
  var basemap_hidden = true;
  // при клике показывать/не показывать basemap_panel
  document.getElementById("basemap_button").addEventListener("click",
    function() {
      if(basemap_hidden){
        document.getElementById('basemap_panel').style.display = "inline-block";
        basemap_hidden=false;
      }else{
        document.getElementById('basemap_panel').style.display = "none";
        basemap_hidden=true;
      }
  });

  // не показывать окно со Слоями
  var layer_hidden = true;
  // при клике показывать/не показывать layer_content
  document.getElementById("layer_button").addEventListener("click",
    function() {
      if(layer_hidden){
        document.getElementById("layer_content").style.display = "inline-block";
        layer_hidden = false;
      }else{
        document.getElementById("layer_content").style.display = "none";
        layer_hidden = true;
      }
  });

  // не показывать окно с Маршрутом
  var direction_hidden = true;
  // при клике показывать/не показывать direction_panel
  document.getElementById("direction_button").addEventListener("click",
    function() {
      if(direction_hidden){
        document.getElementById("direction_panel").style.display = "inline-block";
        direction_hidden = false;
      }else{
        document.getElementById("direction_panel").style.display = "none";
        direction_hidden = true;
      }
  });

  // при клике показывать/не показывать direction_panel
  document.getElementById("crime_button").addEventListener("click",
    function() {
      if(!query_data_panel){
        document.getElementById("query_data_panel").style.display = "inline-block";
        document.getElementById("crime_period_panel").style.display = "none";
        document.getElementById("crime_hard_panel").style.display = "none";
        crime_period_hidden = true;
        crime_hard_hidden = true;
        query_data_panel = true;
      }else{
        document.getElementById("query_data_panel").style.display = "none";
        query_data_panel = false;
      }
  });
  // при клике показывать crime_period_panel
  document.getElementById("change_crime_button").addEventListener("click",
    function(){
      document.getElementById("query_data_panel").style.display = "none";
      document.getElementById("crime_period_panel").style.display = "inline-block";
      crime_period_hidden = true;
      query_data_panel = false;
  });
  // при клике показывать crime_hard_panel
  document.getElementById("change_hard_button").addEventListener("click",
    function(){
      document.getElementById("query_data_panel").style.display = "none";
      document.getElementById("crime_hard_panel").style.display = "inline-block";
      crime_hard_hidden = true;
      query_data_panel = false;
  });

  dayCount = 2;
  periodCount = "th_w_m_h_y";
  periods_active = false;
  document.getElementById("week").addEventListener("click",
    function() {
      checkClass("periods");
      document.getElementById('week').classList.add("periods-active");
      periods_active = true;
      dayCount = 6;
      periodCount = "th_w_m_h_y"
  });
  document.getElementById("month").addEventListener("click",
    function() {
      checkClass("periods");
      document.getElementById('month').classList.add("periods-active");
      periods_active = true;
      dayCount = 30;
      periodCount = "th_w_m_h_y"
  });
  document.getElementById("half_year").addEventListener("click",
    function() {
      checkClass("periods");
      document.getElementById('half_year').classList.add("periods-active");
      periods_active = true;
      dayCount = 182;
      periodCount = "th_w_m_h_y"
  });
  document.getElementById("year").addEventListener("click",
    function() {
      checkClass("periods");
      document.getElementById('year').classList.add("periods-active");
      periods_active = true;
      dayCount = 365;
      periodCount = "th_w_m_h_y"
  });
  document.getElementById("my_period").addEventListener("click",
    function() {
      checkClass("periods");
      document.getElementById('my_period').classList.add("periods-active");
      document.getElementById('my_period_panel').style.display = "block";
      periods_active = true;
      periodCount = "my_period";
  });

  hard_count = 0;
  document.getElementById("hard_1").addEventListener("click",
    function() {
      checkClass("hard_code");
      document.getElementById('hard_1').classList.add("periods-active");
      hard_active = true;
      hard_count = 1;
  });
  document.getElementById("hard_2").addEventListener("click",
    function() {
      checkClass("hard_code");
      document.getElementById('hard_2').classList.add("periods-active");
      hard_active = true;
      hard_count = 2;
  });
  document.getElementById("hard_3").addEventListener("click",
    function() {
      checkClass("hard_code");
      document.getElementById('hard_3').classList.add("periods-active");
      hard_active = true;
      hard_count = 3;
  });
  document.getElementById("hard_4").addEventListener("click",
    function() {
      checkClass("hard_code");
      document.getElementById('hard_4').classList.add("periods-active");
      hard_active = true;
      hard_count = 4;
  });
  document.getElementById("hard_5").addEventListener("click",
    function() {
      checkClass("hard_code");
      document.getElementById('hard_5').classList.add("periods-active");
      hard_active = true;
      hard_count = 5;
  });
  document.getElementById("hard_6").addEventListener("click",
    function() {
      checkClass("hard_code");
      document.getElementById('hard_6').classList.add("periods-active");
      hard_active = true;
      hard_count = 6;
  });
  document.getElementById("hard_all").addEventListener("click",
    function() {
      checkClass("hard_code");
      document.getElementById('hard_all').classList.add("periods-active");
      hard_active = true;
      hard_count = 0;
  });

  // var featureCollection = {
  //     featureSet: {
  //         features: [],
  //         geometryType: "esriGeometryPoint"
  //     }
  // };
  // var featureLayer1 = new FeatureLayer(featureCollection, {id: 'heatLayer', mode: FeatureLayer.MODE_SNAPSHOT});
  // featureLayer1.setRenderer(renderer);
  // map.addLayer(featureLayer1);
  //***************Функции**************

  // Открывает widget для distance и area
  function setActiveWidget(type) {
    switch (type) {
      case "distance":
        activeWidget = new DistanceMeasurement2D({
          view: view
        });

        // skip the initial 'new measurement' button
        activeWidget.viewModel.newMeasurement();
        console.log(activeWidget);
        view.ui.add(activeWidget, "top-right");
        setActiveButton(document.getElementById('distanceButton'));
        break;

      case "area":
        activeWidget = new AreaMeasurement2D({
          view: view
        });

          // skip the initial 'new measurement' button
        activeWidget.viewModel.newMeasurement();

        view.ui.add(activeWidget, "top-right");
        setActiveButton(document.getElementById('areaButton'));
        break;
      case null:
        if (activeWidget) {
          view.ui.remove(activeWidget);
          activeWidget.destroy();
          activeWidget = null;
        }
        break;
    }
  };

  // Кнопка нажата или нет
  function setActiveButton(selectedButton) {
    // focus the view to activate keyboard shortcuts for sketching
    view.focus();
    var elements = document.getElementsByClassName("active");
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove("active");
    }
    if (selectedButton) {
      selectedButton.classList.add("active");
    }
  };

  function checkClass(e){
    switch (e) {
      case "periods":
        if(periods_active){
          if(document.getElementById("my_period").classList.contains("periods-active")){
            document.getElementById("my_period_panel").style.display = "none";
          };
          document.getElementsByClassName("periods-active")[0].classList.remove("periods-active");
          periods_active = false;
        };
        break;
      case "hard_code":
        if(hard_active){
          document.getElementsByClassName("periods-active")[0].classList.remove("periods-active");
          hard_active = false;
        };
        break;

    }

  };



  function doQuery(){
    document.getElementById("crime_period_panel").style.display = "none";
    document.getElementById("crime_hard_panel").style.display = "none";
    document.getElementById("onClickLoader").style.display = 'inline-block';
    map.layers.remove(heatmapLayer);
    map.layers.remove(resultsLayer);
    // Куда запрос
    var query = featureLayer.createQuery();
    // Данные запроса
    query.returnGeometry = true;
    query.outFields = ["HARD_CODE,CRIME_CODE,DAT_SOVER_STR,STAT,ORGAN,UD,FZ1R18P5,FZ1R18P6"];
    query.outSpatialReference = new SpatialReference(4326);

    where=""+hardCode()+"CITY_CODE = 1975 AND DAT_SOVER>= TIMESTAMP '"+getDate("start")+"'"+
        " AND DAT_SOVER<= TIMESTAMP '"+getDate("end")+"'";
    //DAT_SOVER>= TIMESTAMP '2019-02-01 00:00:00' AND DAT_SOVER<= TIMESTAMP '2019-02-14 23:59:59'
    console.log(where);
    query.where = where;
    return featureLayer.queryFeatures(query);
  };

  // При получение данных
  function getResults(results){
    // console.log(results);
    getDataClear();
    resultsLayer.removeAll();
    var crimePopup = {
      title: "{CRIME_CODE}",
      content: [
      {
        type: 'fields',
        fieldInfos: [
          {
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
          }
        ]
      }]
    };
    var features = results.features.map(function(graphic) {
      graphic.symbol = checkSymbol(graphic.attributes.CRIME_CODE);
      // checkSymbol(graphic.attributes.HARD_CODE);
      checkSymbol(graphic.attributes.CRIME_CODE);
      graphic.attributes.HARD_CODE = changeHardCode(graphic.attributes.HARD_CODE);
      graphic.attributes.CRIME_CODE = changeCrimeCode(graphic.attributes.CRIME_CODE);
      graphic.popupTemplate = crimePopup;

      return graphic;
    });
    console.log(features);
    getData(features.length);
    resultsLayer.addMany(features);
    document.getElementById('onClickLoader').style.display = 'none';
  };
  // При ошибке
  function promiseRejected(error){
    document.getElementById('onClickLoader').style.display = 'none';
    alert("Ошибка");
    console.log("Ошибка: ", error.message);
    // document.getElementById('viewDiv').classList.remove("ld-over-full-inverse");
  };
var d=1;
  // Добавление картинок
  function checkSymbol(e) {
    var symbol = {
      type: "picture-marker",
      url: "",
      width: 20,
      height: 20,
    };
console.log(d);
d+=1;
    switch (e){
      case "0990":
        symbol.url = "./images/crime_icons/c-099.png";
        break;
      case "1000":
        symbol.url = "./images/crime_icons/c-100.png";
        break;
      case "1010":
        symbol.url = "./images/crime_icons/c-101.png";
        break;
      case "1020":
        symbol.url = "./images/crime_icons/c-102.png";
        break;
      case "1030":
        symbol.url = "./images/crime_icons/c-103.png";
        break;
      case "1040":
        symbol.url = "./images/crime_icons/c-104.png";
        break;
      case "1050":
        symbol.url = "./images/crime_icons/c-105.png";
        break;
      case "1060":
        symbol.url = "./images/crime_icons/c-106.png";
        break;
      case "1070":
        symbol.url = "./images/crime_icons/c-107.png";
        break;
      case "1080":
        symbol.url = "./images/crime_icons/c-108.png";
        break;
      case "1110":
        symbol.url = "./images/crime_icons/c-111.png";
        break;
      case "1120":
        symbol.url = "./images/crime_icons/c-112.png";
        break;
      case "1130":
        symbol.url = "./images/crime_icons/c-113.png";
        break;
      case "1140":
        symbol.url = "./images/crime_icons/c-114.png";
        break;
      case "1190":
        symbol.url = "./images/crime_icons/c-119.png";
        break;
      case "1200":
        symbol.url = "./images/crime_icons/c-120.png";
        break;
      case "1210":
        symbol.url = "./images/crime_icons/c-121.png";
        break;
      case "1220":
        symbol.url = "./images/crime_icons/c-122.png";
        break;
      case "1260":
        symbol.url = "./images/crime_icons/c-126.png";
        break;
      case "1460":
        symbol.url = "./images/crime_icons/c-146.png";
        break;
      case "1490":
        symbol.url = "./images/crime_icons/c-149.png";
        break;
      case "1870":
        symbol.url = "./images/crime_icons/c-187.png";
        break;
      case "1880":
        symbol.url = "./images/crime_icons/c-188.png";
        break;
      case "1890":
        symbol.url = "./images/crime_icons/c-189.png";
        break;
      case "1900":
        symbol.url = "./images/crime_icons/c-190.png";
        break;
      case "1910":
        symbol.url = "./images/crime_icons/c-191.png";
        break;
      case "1920":
        symbol.url = "./images/crime_icons/c-192.png";
        break;
      case "1930":
        symbol.url = "./images/crime_icons/c-193.png";
        break;
      case "1940":
        symbol.url = "./images/crime_icons/c-194.png";
        break;
      case "2770":
        symbol.url = "./images/crime_icons/c-277.png";
        break;
      case "2790":
        symbol.url = "./images/crime_icons/c-279.png";
        break;
      case "2860":
        symbol.url = "./images/crime_icons/c-286.png";
        break;
      case "2870":
        symbol.url = "./images/crime_icons/c-287.png";
        break;
      case "2880":
        symbol.url = "./images/crime_icons/c-288.png";
        break;
      case "2910":
        symbol.url = "./images/crime_icons/c-291.png";
        break;
      case "2920":
        symbol.url = "./images/crime_icons/c-292.png";
        break;
      case "2930":
        symbol.url = "./images/crime_icons/c-293.png";
        break;
      case "2940":
        symbol.url = "./images/crime_icons/c-294.png";
        break;
      case "2960":
        symbol.url = "./images/crime_icons/c-296.png";
        break;
      case "2970":
        symbol.url = "./images/crime_icons/c-297.png";
        break;
      case "3000":
        symbol.url = "./images/crime_icons/c-300.png";
        break;
      case "3020":
        symbol.url = "./images/crime_icons/c-302.png";
        break;
      case "3070":
        symbol.url = "./images/crime_icons/c-307.png";
        break;
      case "3090":
        symbol.url = "./images/crime_icons/c-309.png";
        break;
      case "3100":
        symbol.url = "./images/crime_icons/c-310.png";
        break;
      case "3140":
        symbol.url = "./images/crime_icons/c-314.png";
        break;
      case "3190":
        symbol.url = "./images/crime_icons/c-319.png";
        break;
      case "3240":
        symbol.url = "./images/crime_icons/c-324.png";
        break;
      case "3250":
        symbol.url = "./images/crime_icons/c-325.png";
        break;
      case "3260":
        symbol.url = "./images/crime_icons/c-326.png";
        break;
      case "3270":
        symbol.url = "./images/crime_icons/c-327.png";
        break;
      case "3280":
        symbol.url = "./images/crime_icons/c-328.png";
        break;
      case "3290":
        symbol.url = "./images/crime_icons/c-329.png";
        break;
      case "3300":
        symbol.url = "./images/crime_icons/c-330.png";
        break;
      case "3310":
        symbol.url = "./images/crime_icons/c-331.png";
        break;
      case "3320":
        symbol.url = "./images/crime_icons/c-332.png";
        break;
      case "3330":
        symbol.url = "./images/crime_icons/c-333.png";
        break;
      case "3340":
        symbol.url = "./images/crime_icons/c-334.png";
        break;
      case "3350":
        symbol.url = "./images/crime_icons/c-335.png";
        break;
      case "3360":
        symbol.url = "./images/crime_icons/c-336.png";
        break;
      case "3370":
        symbol.url = "./images/crime_icons/c-337.png";
        break;
      case "3380":
        symbol.url = "./images/crime_icons/c-338.png";
        break;
      case "3390":
        symbol.url = "./images/crime_icons/c-339.png";
        break;
      case "3400":
        symbol.url = "./images/crime_icons/c-340.png";
        break;
      case "3410":
        symbol.url = "./images/crime_icons/c-341.png";
        break;
      case "3420":
        symbol.url = "./images/crime_icons/c-342.png";
        break;
      case "3430":
        symbol.url = "./images/crime_icons/c-343.png";
        break;
      default:
        symbol.url = "./images/crime_icons/c-all.png";
        break;
    };
    crimeArray(e,symbol.url);
    return symbol;
  };

  var arrName = [], arrCount = [], arrUrl = [];
  function getDataClear(){
    arrName = [], arrCount = [], arrUrl = [];
  };
  function getData(crimeCount){
    quickSort(arrCount, arrName, arrUrl, 0, arrCount.length - 1);

    var tableText = "";
    if (arrCount.length > 0) {
      map.layers.add(resultsLayer);
      map.layers.add(heatmapLayer);
      heatmapLayer.definitionExpression = where;
      heatmapLayer.visible = true;
      console.log(map.layers);
      document.getElementById("query_data_panel").style.display = "inline-block";
      tableText = "<table id=\"table_data\">";
      tableText += "<thead><tr>" +
                   "<th style=\"text-align: center;\" colspan=\"2\" > Cтатья </th>" +
                   "<th style=\"width: 25%\"> Кол-во (" +
                   crimeCount+
                   ")</th>" +
                   "</tr></thead>"
      tableText += "<tbody>";

      for (var i = arrCount.length - 1; i >= 0; i--) {
          tableText += "<tr>" +
                       "<td style=\"text-align: center;\">" +
                       "<img src=\"" + arrUrl[i] + "\"/>" +
                       "</td><td style=\"text-align: center;\">" +
                       changeCrimeCode(arrName[i]) +
                       "</td><td style=\"text-align: center;\">" +
                       arrCount[i] +
                       "</td></tr>";
      };
      tableText += "</tbody></table>";
      document.getElementById("query_data_panel_body").innerHTML = tableText;
    }else if(arrCount.length == 0) {
      document.getElementById("query_data_panel").style.display = "inline-block";
      if(start_day == end_day){
        alert("В это день " +start_day+" преступлений не зарегистрированно");
      }else {
      alert("За этот период " +start_day+" - "+end_day+" преступлений не зарегистрированно");
    };
      document.getElementById("query_data_panel_body").innerHTML = tableText;
    };
    query_data_panel = true;
  };

  function quickSort(count, name, url, left, right) {
    var index;
    if (count.length > 1) {
      index = partition(count, name, url, left, right);
      if (left < index - 1) {
        quickSort(count, name, url, left, index - 1);
      }
      if (index < right) {
        quickSort(count, name, url, index, right);
      }
    }
    return count;
  };
  function partition(count, name, url, left, right) {
    var pivot = count[Math.floor((right + left) / 2)],
        i     = left,
        j     = right;

    while (i <= j) {
      while (count[i] < pivot) {
        i++;
      }
      while (count[j] > pivot) {
        j--;
      }
      if (i <= j) {
        swap(count, name, url, i, j);
        i++;
        j--;
      }
    }
    return i;
  };
  function swap(count, name, url, firstIndex, secondIndex){
    const tempC = count[firstIndex];
    count[firstIndex] = count[secondIndex];
    count[secondIndex] = tempC;
    const tempN = name[firstIndex];
    name[firstIndex] = name[secondIndex];
    name[secondIndex] = tempN;
    const tempU = url[firstIndex];
    url[firstIndex] = url[secondIndex];
    url[secondIndex] = tempU;
  };

  function crimeArray(crime_code, url){
    var value = arrName.find(function(elem){
      return elem == crime_code;
    });
    if (value !== crime_code){
      arrName.push(crime_code);
      arrCount.push(1);
      arrUrl.push(url);
      console.log(arrName);
      console.log(arrCount);
      console.log(arrUrl);

    }else {
      arrCount[arrName.indexOf(crime_code)]+=1;
    };
  };

  function hardCode(){
    var str = "";
    switch (hard_count) {
      case 0:
        str = "";
        break;
      case 1:
        str = "HARD_CODE = 1 AND ";
        break;
      case 2:
        str = "HARD_CODE = 2 AND ";
        break;
      case 3:
        str = "HARD_CODE = 3 AND ";
        break;
      case 4:
        str = "HARD_CODE = 4 AND ";
        break;
      case 5:
        str = "HARD_CODE = 5 AND ";
        break;
      case 6:
        str = "HARD_CODE = 6 AND ";
        break;
    }
    return str;
  };
  // Изменение входных данных HARD_CODE
  function changeHardCode(value) {
    var content;
    switch(value) {
      case "1": content = "небольшой тяжести"; break;
      case "2": content = "средней тяжести"; break;
      case "3": content = "тяжкие"; break;
      case "4": content = "особо тяжкие"; break;
      case "5": content = "преступления"; break;
      case "6": content = "проступки"; break;
      default : content = "Не определена"; break;
    };
    return content;
  };

  // Изменение входных данных CRIME_CODE
  function changeCrimeCode(value) {
    var content;
    switch(value) {
      case "0990" : content = "Убийство"; break;
      case "1000" : content = "Убийство матерью новорожденного ребенка"; break;
      case "1010" : content = "Убийство, совершенное в состоянии аффекта"; break;
      case "1020" : content = "Убийство, совершенное при превышении пределов необходимой обороны"; break;
      case "1030" : content = "Убийство, совершенное при превышении мер, необходимых для задержания лица, совершившего преступление"; break;
      case "1040" : content = "Причинение смерти по неосторожности"; break;
      case "1050" : content = "Доведение до самоубийства"; break;
      case "1060" : content = "Умышленное причинение тяжкого вреда здоровью"; break;
      case "1070" : content = "Умышленное причинение средней тяжести вреда здоровью"; break;
      // case "1080" : content = "Умышленное причинение легкого вреда здоровью"; break;
      case "1100" : content = "Истязание"; break;
      case "1110" : content = "Причинение вреда здоровью в состоянии аффекта"; break;
      case "1120" : content = "Причинение тяжкого вреда здоровью при превышении пределов необходимой обороны"; break;
      case "1130" : content = "Причинение тяжкого вреда здоровью при задержании лица, совершившего преступление"; break;
      case "1140" : content = "Неосторожное причинение вреда здоровью"; break;
      case "1150" : content = "Угроза"; break;
      case "1160" : content = "Принуждение к изъятию или незаконное изъятие органов и тканей человека"; break;
      case "1170" : content = "Заражение венерической болезнью"; break;
      case "1190" : content = "Оставление в опасности"; break;
      case "1200" : content = "Изнасилование"; break;
      case "1210" : content = "Насильственные действия сексуального характера"; break;
      case "1220" : content = "Половое сношение или иные действия сексуального характера с лицом, не достигшим шестнадцатилетнего возраста"; break;
      case "1260" : content = "Незаконное лишение свободы"; break;
      case "1460" : content = "Пытки"; break;
      case "1490" : content = "Нарушение неприкосновенности жилища"; break;
      case "1870" : content = "Мелкое хищение"; break;
      case "1880" : content = "Кража"; break;
      case "1890" : content = "Присвоение или растрата вверенного чужого имущества"; break;
      case "1900" : content = "Мошенничество"; break;
      case "1910" : content = "Грабеж"; break;
      case "1920" : content = "Разбой"; break;
      case "1930" : content = "Хищение предметов, имеющих особую ценность"; break;
      case "1940" : content = "Вымогательство"; break;
      case "2770" : content = "Нарушение правил безопасности при ведении горных или строительных работ"; break;
      case "2790" : content = "Нарушение правил или требований нормативов в сфере архитектурной, градостроительной и строительной деятельности"; break;
      case "2860" : content = "Контрабанда изъятых из обращения предметов или предметов, обращение которых ограничено"; break;
      case "2870" : content = "Незаконные хранение оружия, боеприпасов, взрывчатых веществ и взрывных устройств"; break;
      case "2880" : content = "Незаконное изготовление оружия"; break;
      case "2910" : content = "Хищение либо вымогательство оружия, боеприпасов, взрывчатых веществ и взрывных устройств"; break;
      case "2920" : content = "Нарушение требований пожарной безопасности"; break;
      case "2930" : content = "Хулиганство"; break;
      case "2940" : content = "Вандализм"; break;
      case "2960" : content = "Незаконное обращение с наркотическими средствами, психотропными веществами, их аналогами, прекурсорами без цели сбыта"; break;
      case "2970" : content = "Незаконные изготовление, переработка, приобретение, хранение, перевозка в целях сбыта, пересылка либо сбыт наркотических средств, психотропных веществ, их аналогов"; break;
      case "3000" : content = "Незаконное культивирование запрещенных к возделыванию растений, содержащих наркотические вещества"; break;
      case "3020" : content = "Организация или содержание притонов для потребления наркотических средств, психотропных веществ"; break;
      case "3070" : content = "Организация незаконного игорного бизнеса"; break;
      case "3090" : content = "Организация или содержание притонов для занятия проституцией и сводничество"; break;
      case "3100" : content = "Организация или содержание притонов для одурманивания с использованием лекарственных или других средств"; break;
      case "3140" : content = "Надругательство над телами умерших и местами их захоронения"; break;
        case "3190" : content = "Незаконное производство аборта"; break;
      case "3240" : content = "Нарушение экологических требований к хозяйственной или иной деятельности"; break;
      case "3250" : content = "Нарушение экологических требований при обращении с экологически потенциально опасными химическими или биологическими веществами"; break;
      case "3260" : content = "Нарушение экологических требований при обращении с микробиологическими или другими биологическими агентами или токсинами"; break;
      case "3270" : content = "Нарушение ветеринарных правил или правил, установленных для борьбы с болезнями и вредителями растений"; break;
      case "3280" : content = "Загрязнение, засорение или истощение вод"; break;
      case "3290" : content = "Загрязнение атмосферы"; break;
      case "3300" : content = "Загрязнение морской среды"; break;
      case "3310" : content = "Нарушение законодательства о континентальном шельфе Республики Казахстан и исключительной экономической зоне Республики Казахстан"; break;
      case "3320" : content = "Порча земли"; break;
      case "3330" : content = "Нарушение правил охраны и использования недр"; break;
      case "3340" : content = "Самовольное пользование недрами"; break;
      case "3350" : content = "Незаконная добыча рыбных ресурсов, других водных животных или растений"; break;
      case "3360" : content = "Нарушение правил охраны рыбных запасов"; break;
      case "3370" : content = "Незаконная охота"; break;
      case "3380" : content = "Нарушение правил охраны животного мира"; break;
      case "3390" : content = "Незаконное обращение с редкими и находящимися под угрозой исчезновения, а также запрещенными к пользованию видами растений или животных, их частями или дериватами"; break;
      case "3400" : content = "Незаконная порубка, уничтожение или повреждение деревьев и кустарников"; break;
      case "3410" : content = "Уничтожение или повреждение лесов"; break;
      case "3420" : content = "Нарушение режима особо охраняемых природных территорий"; break;
      case "3430" : content = "Непринятие мер по ликвидации последствий экологического загрязнения"; break;
      default: return value;
    };
    return content;
  };

  document.getElementById("my_period_calendar_start").setAttribute("max", new Date());
  document.getElementById("my_period_calendar_end").setAttribute("max", new Date());
  // Дата начала в календаре
  document.getElementById("my_period_calendar_start").onchange = function(){
    my_period_calendar_start = document.getElementById("my_period_calendar_start").value;
    var calendar_date = new Date(my_period_calendar_start);
    var year_cal_date = calendar_date.getFullYear();
    // console.log(year_cal_date);
    document.getElementById("my_period_calendar_end").setAttribute("min", my_period_calendar_start);
    // document.getElementById("my_period_calendar_end").setAttribute("max", );
  };
  // Дата конца в календаре
  document.getElementById("my_period_calendar_end").onchange = function(){
    my_period_calendar_end = document.getElementById("my_period_calendar_end").value;
    document.getElementById("my_period_calendar_start").setAttribute("max", my_period_calendar_end);
  };
  // Сегодняшняя дата
  function getDate(e) {
    var pC = periodCount;
    if(e == "start"){
      switch (pC) {
        case "th_w_m_h_y":
          var startDate = getStartDate(new Date(), dayCount);
          var year = startDate.getFullYear();
          var month = startDate.getMonth()+1;
          if(month < 10){
            month = "0" + month;
          };
          var day = startDate.getDate();
          if(day < 10){
            day = "0" + day;
          };
          start_day = String(year+"-" + month +"-"+ day);
          return String(year+"-" + month +"-"+ day+" 00:00:00");
          break;
        case "my_period":
          start_day = String(my_period_calendar_start);
          return String(my_period_calendar_start+" 00:00:00");
          break;
        }
    }else{
      switch (pC) {
        case "th_w_m_h_y":
          var endDate = new Date();
          var year = endDate.getFullYear();
          var month = endDate.getMonth()+1;
          if(month < 10){
            month = "0" + month;
          };
          var day = endDate.getDate();
          if(day < 10){
            day = "0" + day;
          };
          end_day = String(year+"-" + month +"-"+ day);
          return String(year+"-" + month +"-"+ day+" 23:59:59");
          break;
        case "my_period":
          end_day = String(my_period_calendar_end);
          return String(my_period_calendar_end+" 23:59:59");
          break;
        }
      }
  };
  // Начальная дата week,month,half,year
  function getStartDate(theDate, dC) {
    return new Date(theDate.getTime() - dC*24*60*60*1000);
  };

  // function executeIdentifyTask(event) {
  //   // Set the geometry to the location of the view click
  //   params.geometry = event.mapPoint;
  //   params.mapExtent = view.extent;
  //   document.getElementById("viewDiv").style.cursor = "wait";
  //
  //   // This function returns a promise that resolves to an array of features
  //   // A custom popupTemplate is set for each feature based on the layer it
  //   // originates from
  //   identifyTask.execute(params).then(function(response) {
  //
  //         var results = response.results;
  //
  //         return results.map(function(result) {
  //
  //           var feature = result.feature;
  //           var layerName = result.layerName;
  //
  //           feature.attributes.layerName = layerName;
  //
  //           if (layerName === 'Здания и сооружения') {
  //             feature.popupTemplate = { // autocasts as new PopupTemplate()
  //               title: "{layerName}",
  //               content: [{
  //             type: "fields",
  //             fieldInfos:[{
  //               fieldName: "Адресный массив",
  //               label: "Адресный массив:",
  //               visible: true,
  //             },{
  //               fieldName: "Количество этажей",
  //               label: "Количество этажей:",
  //               visible: true
  //             },{
  //               fieldName: "Год постройки",
  //               label: "Год постройки:",
  //               visible: true
  //             },{
  //               fieldName: "Общая площадь",
  //               label: "Общая площадь:",
  //               visible: true
  //             },{
  //               fieldName: "Объем здания, м3",
  //               label: "Объем здания, м3:",
  //               visible: true
  //             },{
  //               fieldName: "Площадь жил. помещения",
  //               label: "Площадь жил. помещения:",
  //               visible: true
  //             },{
  //               fieldName: "Площадь застройки, м2",
  //               label: "Площадь застройки, м2:",
  //               visible: true
  //             },{
  //               fieldName: "Наименование первичной улицы",
  //               label: "Наименование первичной улицы:",
  //               visible: true
  //             },{
  //               fieldName: "Основной номер дома",
  //               label: "Основной номер дома:",
  //               visible: true
  //             }]
  //           }]
  //             };
  //           }
  //           return feature;
  //         });
  //       }).then(showPopup); // Send the array of features to showPopup()
  //
  //   // Shows the results of the Identify in a popup once the promise is resolved
  //   function showPopup(response) {
  //     if (response.length > 0) {
  //       view.popup.open({
  //         features: response,
  //         location: event.mapPoint
  //       });
  //     }
  //     document.getElementById("viewDiv").style.cursor = "auto";
  //   }
  // }

});
