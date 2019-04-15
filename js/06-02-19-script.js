require([
  // "esri/widgets/Home/HomeViewModel",
  "esri/widgets/LayerList",
  "esri/widgets/ScaleBar",
  "esri/tasks/IdentifyTask",
  "esri/tasks/support/IdentifyParameters",
  // "esri/layers/FeatureLayer",
  "esri/widgets/Locate",
  "esri/widgets/Home",
  "esri/widgets/Fullscreen",
  // "esri/widgets/Track",
  "esri/core/urlUtils",
  "esri/widgets/Directions",
  "esri/widgets/BasemapGallery",
  "esri/widgets/Search",
  "esri/widgets/CoordinateConversion",
  // "esri/layers/GraphicsLayer",
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
  // HomeVM,
  LayerList,
  ScaleBar,
  IdentifyTask,
  IdentifyParameters,
  // FeatureLayer,
  Locate,
  Fullscreen,
  Home,
  // Track,
  urlUtils,
  Directions,
  BasemapGallery,
  Search,
  CoordinateConversion,
  // GraphicsLayer,
  // Sketch,
  TileLayer,
  Basemap,
  // Locator,
  DistanceMeasurement2D,
  AreaMeasurement2D,
  MapView,
  WebMap,
  Map,
  esriConfig
){

  var identifyTask, identifyParams, tileLayer, myBasemap, map, view, ccWidget, searchWidget, basemapGallery,
    fullscreen, locateBtn, home;
  var activeWidget = null;
  // var graphicsLayer = new GraphicsLayer();

  // Прокси-маршрут запрашивает, чтобы избежать запроса на вход в систему
  // urlUtils.addProxyRule({
  //   urlPrefix: "route.arcgis.com",
  //   proxyUrl: "/sproxy/"
  // });

  // tileLayer = new TileLayer({
  //  url: "https://gis.uaig.kz/server/rest/services/Map2d/Базовая_карта_MIL1/MapServer"
  // });
  //
  // myBasemap = new Basemap({
  //   baseLayers: [tileLayer],
  //   // thumbnailUrl: "https://www.example.com/images/thumbnail_2014-11-25_61051.png",
  //   id: "myMap"
  // });
  //
  var basemaps = ["satellite","hybrid","streets","topo","dark-gray","gray",
   "national-geographic","terrain","oceans","osm"];
  // // Create the Map
  var map1 = new Map({
      basemap: null
  });

  esriConfig.portalUrl = "https://gis.uaig.kz/arcgis/sharing/rest/content/items";
  map = new WebMap({
    portalItem: {
      id: "b5a3c97bd18442c1949ba5aefc4c1835"
    }
  });

  // Create the MapView
  view = new MapView({
    container: "viewDiv",  // Reference to the scene div created in step 5
    map: map,  // Reference to the map object created before the scene
    zoom: 1,  // Sets zoom level based on level of detail (LOD)
    center: [76.92861, 43.25667]  // Sets center point of view using longitude,latitude
  });

  view.when(function() {
    document.getElementById('main_loading').style.display = 'none';

    view.ui.add("topRight", "top-right");
    view.ui.add("topLeft", "top-left");

    //Добавление на карту Кординаты
    ccWidget = new CoordinateConversion({
      view: view
    });
    view.ui.add(ccWidget, "bottom-left");

    //Добавление на карту Поиск
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
    //create identify tasks and setup parameters
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

    //Базовые карты arcGis
    // basemapGallery = new BasemapGallery({
    //   view: view
    // }, "basemap_content");

    //Карты
    document.getElementById("almaty2d").addEventListener("click",
      function () {
        view.map = map;
      }
    )
    document.getElementById("satellite").addEventListener("click",
      function () {
        view.map = map1;
        map1.basemap = basemaps[0];
      }
    )
    document.getElementById("hybrid").addEventListener("click",
      function () {
        view.map = map1;
        map1.basemap = basemaps[1];
      }
    )
    document.getElementById("streets").addEventListener("click",
      function () {
        view.map = map1;
        map1.basemap = basemaps[2];
      }
    )
    document.getElementById("topo").addEventListener("click",
      function () {
        view.map = map1;
        map1.basemap = basemaps[3];
      }
    )
    document.getElementById("dark-gray").addEventListener("click",
      function () {
        view.map = map1;
        map1.basemap = basemaps[4];
      }
    )
    document.getElementById("gray").addEventListener("click",
      function () {
        view.map = map1;
        map1.basemap = basemaps[5];
      }
    )
    document.getElementById("national-geographic").addEventListener("click",
      function () {
        view.map = map1;
        map1.basemap = basemaps[6];
      }
    )
    document.getElementById("terrain").addEventListener("click",
      function () {
        view.map = map1;
        map1.basemap = basemaps[7];
      }
    )
    document.getElementById("oceans").addEventListener("click",
      function () {
        view.map = map1;
        map1.basemap = basemaps[8];
      }
    )
    document.getElementById("osm").addEventListener("click",
      function () {
        view.map = map1;
        map1.basemap = basemaps[9];
      }
    )

    //Слои
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
            console.log(item.layer.legendEnabled);
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
    // console.log(layerList);

    layerList.on("trigger-action", function(event) {
// console.log(event);
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

    // Маршрут
    // var directionsWidget = new Directions({
    //   view: view
    // });
    // view.ui.add(directionsWidget, "top-left");

    var scalebar = new ScaleBar({
      view: view,
      style: "ruler"
    });
    view.ui.add(scalebar, "bottom-left");

    //На полный экран
    var fullscreen = new Fullscreen({
      view: view
    });
    view.ui.add(fullscreen, "top-right");

    //Местоположение
    var locateBtn = new Locate({
      view: view
    }, "locate_button");
    // view.ui.add(locateBtn, "top-right");

    //В центр
    var home = new Home({
      view: view
    });
    view.ui.add(home, "top-right");

  },function(error){

  });

  /*************Виджеты***************/

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

  //Площадь
  document.getElementById("areaButton").addEventListener("click",
    function () {
      setActiveWidget(null);
      if (!this.classList.contains('active')) {
        setActiveWidget('area');
      } else {
        setActiveButton(null);
      }
    });

  //не показывать окно с Базовыми картами
  var basemap_hidden = true;
  //при клике показывать/не показывать basemap_panel
  document.getElementById("basemap_button").addEventListener("click",
    function() {
      if(basemap_hidden){
        document.getElementById('basemap_panel').style.visibility = "visible";
        basemap_hidden=false;
      }else{
        document.getElementById('basemap_panel').style.visibility = "hidden";
        basemap_hidden=true;
      }
    }
  );

  //не показывать окно со Слоями
  var layer_hidden = true;
  //при клике показывать/не показывать layer_content
  document.getElementById("layer_button").addEventListener("click",
    function() {
      if(layer_hidden){
        document.getElementById("layer_content").style.visibility = "visible";
        layer_hidden = false;
      }else{
        document.getElementById("layer_content").style.visibility = "hidden";
        layer_hidden = true;
      }
    }
  )

  //не показывать окно с Маршрутом
  var direction_hidden = true;
  //при клике показывать/не показывать direction_panel
  document.getElementById("direction_button").addEventListener("click",
    function() {
      if(direction_hidden){
        document.getElementById("direction_panel").style.visibility = "visible";
        direction_hidden = false;
      }else{
        document.getElementById("direction_panel").style.visibility = "hidden";
        direction_hidden = true;
      }
    }
  )

  //Открывает widget для distance и area
  function setActiveWidget(type) {
    switch (type) {
      case "distance":
        activeWidget = new DistanceMeasurement2D({
          view: view
        });

        // skip the initial 'new measurement' button
        activeWidget.viewModel.newMeasurement();

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
  }

//Кнопка нажата или нет
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
  }

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
