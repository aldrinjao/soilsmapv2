import { Component, ViewChild, ElementRef, Inject } from '@angular/core';
import { Map, latLng, tileLayer, marker, FeatureGroup, control } from 'leaflet';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { MatTable, MatTableDataSource } from '@angular/material';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SoilIcons } from './markers';
import * as XLSX from 'xlsx';
import { Options } from 'ng5-slider';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


import { MatDatepickerInputEvent } from '@angular/material/datepicker';



// const html2maker = new html2PDF();

export interface SoilSample {
  id: number;
  crop: string;
  ph: string;
  phValue: number;
  om: string;
  n: string;
  nValue: number;
  pValue: number;
  kValue: number;
  omValue: number;
  p: string;
  p_analysis: string;
  k: string;
  textual_grade: string;
  remarks: string;
  collaborator: string;
  province: string;
  municipality: string;
  barangay: string;
  long: number;
  lat: number;
  date: string;
  url: string;
  hasUrl: boolean;
}



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})


export class AppComponent {


  phLowValue = 0;
  phHighValue = 10;

  omLowValue = 0;
  omHighValue = 100;

  nLowValue = 0;
  nHighValue = 10;

  pLowValue = 0;
  pHighValue = 100;

  kLowValue = 0;
  kHighValue = 1;



  phSlideroptions: Options = {
    floor: 0,
    ceil: 10,
    showSelectionBar: true,
    selectionBarGradient: {
      from: 'red',
      to: 'blue'
    }
  };

  slideroptions: Options = {
    floor: 0,
    ceil: 10,
    selectionBarGradient: {
      from: 'black',
      to: 'black'
    }
  };

  omslideroptions: Options = {
    floor: 0,
    ceil: 100,
    selectionBarGradient: {
      from: 'black',
      to: 'black'
    }
  };


  nslideroptions: Options = {
    floor: 0,
    ceil: 1,
    step: .01,
    selectionBarGradient: {
      from: 'black',
      to: 'black'
    }
  };

  pslideroptions: Options = {
    floor: 0,
    ceil: 100,
    step: .01,
    selectionBarGradient: {
      from: 'black',
      to: 'black'
    }
  };


  kslideroptions: Options = {
    floor: 0,
    ceil: 10,
    step: .01,
    selectionBarGradient: {
      from: 'black',
      to: 'black'
    }
  };


  displayedColumns: string[] = [
    'expand',
    'date',
    'barangay',
    'crop',
    'ph',
    'om',
    'n',
    'p',
    'k'
  ];

  SOIL_DATA: SoilSample[] = [];
  dataSource1 = new MatTableDataSource<SoilSample>();
  map;
  // array from firestore
  items: Observable<any[]>;

  markers: SoilIcons = new SoilIcons();

  crops = new FormControl();
  cropList: string[] = [
    'Rice',
    'Corn',
    'Cacao/Coffee',
    'Sugarcane',
    'Tomato',
    'Banana',
    'Soybean'
  ];

  sites = new FormControl();
  // tslint:disable-next-line:max-line-length
  siteList: string[] = [
    'Laguna',
    'Albay',
    'Ilocos Norte',
    'Oriental Mindoro',
    'Nueva Ecija',
    'Isabela',
    'North Cotabato',
    'Misamis Oriental',
    'Cebu',
    'Bukidnon', 'Iloilo'
  ];

  siteFilter = [];
  cropFilter = [];
  eventstart = 0;
  eventend = 9999999999999;



  startdate = new FormControl(new Date(1527782400000));
  enddate = new FormControl(new Date());
  // FeatureGroup for each crop type
  itemsLevel1: FeatureGroup = new FeatureGroup();

  // main FeatureGroup
  layerMainGroup: FeatureGroup[] = [];

  mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
  // tslint:disable-next-line:max-line-length
  mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

  worldImagery = tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; OpenStreetMap contributors'
  });
  grayscale = tileLayer(this.mbUrl, { id: 'mapbox.light', attribution: this.mbAttr });
  streets = tileLayer(this.mbUrl, { id: 'mapbox.streets', attribution: this.mbAttr });

  OpenStreet = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  basemaps = {
    'ESRI World Imagery': this.worldImagery,
    'Open Street Map': this.OpenStreet,
    'Mapbox Grayscale': this.grayscale,
    'Mapbox Streets': this.streets

  };

  title = 'Soils Map';

  options = {
    layers: [this.worldImagery],
    zoom: 5,
    minZoom: 5,
    zoomControl: false,
    center: latLng([12.6, 121.726909]),
    maxZoom: 17
  };


  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filterboxshow') filterboxshow: ElementRef;
  @ViewChild('filterboxid') filterboxid: ElementRef;

  selectedTab = new FormControl(0);


  constructor(db: AngularFireDatabase, private bottomSheet: MatBottomSheet) {

    this.items = db.list('items').valueChanges();

    const myObserver = {
      next: x => {
        x.forEach(sample => {

          let flag = false;
          if (sample.url.length > 0) {
            flag = true;
          }

          const tempObject = {
            // insert the id too
            id: sample.id,
            crop: sample.crop,
            ph: sample.ph,
            phValue: sample.ph_value,
            om: sample.om,
            n: sample.n,
            nValue: sample.n_value,
            p: sample.p,
            pValue: sample.p_value,
            p_analysis: sample.p_analysis,
            k: sample.k,
            kValue: sample.k_value,
            omValue: sample.om_value,
            textual_grade: sample.textual_grade,
            remarks: sample.remarks,
            collaborator: sample.collaborator,
            province: sample.province,
            municipality: sample.municipality,
            barangay: sample.barangay,
            long: sample.long,
            lat: sample.lat,
            date: sample.date,
            url: sample.url,
            hasUrl: flag
          };
          this.SOIL_DATA.push(tempObject);

        });

        this.dataSource1 = new MatTableDataSource(this.SOIL_DATA);
        this.dataSource1.paginator = this.paginator;
        this.dataSource1.sort = this.sort;
        this.createMarkers(this.SOIL_DATA);
      },
      error: err => console.error('Observer got an error: ' + err),
      complete: () => console.log('Observer got a complete notification'),
    };

    this.items.subscribe(myObserver);
  }


  createMarkers(items) {
    console.log('22222');
    items.forEach(samplepoint => {
      console.log(samplepoint.crop);

      const regularIcon = this.markers.iconList[samplepoint.crop].regular;
      const biggerIcon = this.markers.iconList[samplepoint.crop].big;


      // tslint:disable-next-line:max-line-length
      const tempMarker = marker([samplepoint.lat, samplepoint.long], { icon: regularIcon });

      // tslint:disable-next-line:max-line-length
      let popupContent = '<span style=\'font-size:1.5em;font-weight:500;\'>' + samplepoint.crop + '</span><br>' + samplepoint.barangay + '<br>Long: ' + samplepoint.long + '<br>Lat: ' + samplepoint.lat;

      if (samplepoint.n.length > 0) {
        popupContent = popupContent + '<br>N: ' + samplepoint.n;
      }

      if (samplepoint.p.length > 0) {
        popupContent = popupContent + '<br>P:' + samplepoint.p;
      }


      if (samplepoint.k.length > 0) {
        popupContent = popupContent + '<br>K: ' + samplepoint.k;
      }


      if (samplepoint.om.length > 0) {
        popupContent = popupContent + '<br>OM: ' + samplepoint.om;
      }


      if (samplepoint.hasUrl === true) {
        popupContent = popupContent + '<br>Soil Profile: <a target = "new" href="' + samplepoint.url + '">View Soil Profile</a>';
      }

      tempMarker.bindPopup(popupContent);

      tempMarker.on('mouseover', e => {
        e.target.setIcon(biggerIcon);
        e.target.setZIndexOffset('1000');
      });

      tempMarker.on('mouseout', e => {
        e.target.setIcon(regularIcon);
      });
      tempMarker.addTo(this.itemsLevel1);
    });
    this.itemsLevel1.addTo(this.map);


  }

  onMapReady(map: Map) {
    this.map = map;
    control.zoom({
      position: 'topright'
    }).addTo(map);
    // this.map.setMaxBounds(map.getBounds());
    this.map.setView([14.1699, 121.2441], 13);
    control.layers(this.basemaps).addTo(map);

  }



  addEventStart(type: string, event: MatDatepickerInputEvent<Date>) {
    let testDate = '1 1, 1970';
    if (event.value != null) {
      testDate = (event.value.getMonth() + 1) + ' ' + event.value.getDate() + ', ' + event.value.getFullYear();
    }
    this.eventstart = Date.parse(testDate);
  }


  addEventEnd(type: string, event: MatDatepickerInputEvent<Date>) {
    let testDate = '1 1, 2100';
    if (event.value != null) {
      testDate = (event.value.getMonth() + 1) + ' ' + event.value.getDate() + ', ' + event.value.getFullYear();
    }


    this.eventend = Date.parse(testDate);
  }



  filterSelection() {




    let cropres = [];
    let siteres = [];

    if (this.crops.value != null) {
      cropres = this.SOIL_DATA.filter(
        f => this.crops.value.includes(f.crop)
      );

      if (this.crops.value.length === 0) {
        cropres = this.SOIL_DATA;
      }

    } else {
      cropres = this.SOIL_DATA;
    }

    if (this.sites.value != null) {

      siteres = this.SOIL_DATA.filter(
        f => this.sites.value.includes(f.province)
      );

      if (this.sites.value.length === 0) {
        siteres = this.SOIL_DATA;
      }

    } else {
      siteres = this.SOIL_DATA;
    }


    // omLowValue = 0;
    // omHighValue = 100;


    // Create new array

    // filter array for numbers in a range
    const phRange = this.SOIL_DATA.filter(f => {

      return (f.phValue >= this.phLowValue && f.phValue <= this.phHighValue);
    });

    const omRange = this.SOIL_DATA.filter(f => {

      return (f.omValue >= this.omLowValue && f.omValue <= this.omHighValue);
    });

    const nRange = this.SOIL_DATA.filter(f => {

      return (f.nValue >= this.nLowValue && f.nValue <= this.nHighValue);
    });

    const pRange = this.SOIL_DATA.filter(f => {

      return (f.pValue >= this.pLowValue && f.pValue <= this.pHighValue);
    });

    const kRange = this.SOIL_DATA.filter(f => {

      return (f.kValue >= this.kLowValue && f.kValue <= this.kHighValue);
    });


    // filter array for numbers in a range
    const dateRange = this.SOIL_DATA.filter(f => {
      return (Date.parse(f.date) >= this.eventstart && Date.parse(f.date) <= this.eventend);
    });

    // display new filtered array

    let res = cropres.filter(v => { // iterate over the array
      // check sample present in the second array
      return siteres.indexOf(v) > -1;
      // or array2.includes(v)
    });


    res = res.filter(v => {
      // iterate over the array
      // check sample present in the second array
      return phRange.indexOf(v) > -1;
      // or array2.includes(v)
    });
    // make the markers

    res = res.filter(v => {
      // iterate over the array
      // check sample present in the second array
      return omRange.indexOf(v) > -1;
      // or array2.includes(v)
    });
    // make the markers

    res = res.filter(v => {
      // iterate over the array
      // check sample present in the second array
      return nRange.indexOf(v) > -1;
      // or array2.includes(v)
    });
    // make the markers

    res = res.filter(v => {
      // iterate over the array
      // check sample present in the second array
      return pRange.indexOf(v) > -1;
      // or array2.includes(v)
    });
    // make the markers

    res = res.filter(v => {
      // iterate over the array
      // check sample present in the second array
      return kRange.indexOf(v) > -1;
      // or array2.includes(v)
    });
    // make the markers




    res = res.filter(v => {
      // iterate over the array
      // check sample present in the second array
      return dateRange.indexOf(v) > -1;
      // or array2.includes(v)
    });
    // make the markers


    this.itemsLevel1.clearLayers();
    this.dataSource1 = new MatTableDataSource(res);
    this.dataSource1.paginator = this.paginator;
    this.dataSource1.sort = this.sort;
    this.createMarkers(res);
    this.map.fitBounds(this.itemsLevel1.getBounds());

  }

  mouseEnter() {
    this.map.dragging.disable();
    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();
  }

  mouseLeave() {
    this.map.dragging.enable();
    this.map.touchZoom.enable();
    this.map.doubleClickZoom.enable();
    this.map.scrollWheelZoom.enable();
  }

  applyFilter(filterValue: string) {



    this.dataSource1.filter = filterValue.trim().toLowerCase();

  }

  flyToMarker(lat, long) {
    this.map.flyTo(latLng([lat, long]), this.map.getZoom(), {
      animate: true,
      pan: {
        duration: 1
      }
    });
  }

  openBottomSheet(): void {
    this.bottomSheet.open(BottomSheetOverviewExampleSheet);
  }

  resetSelection(): void {
    this.dataSource1 = new MatTableDataSource(this.SOIL_DATA);
    this.createMarkers(this.SOIL_DATA);
    this.dataSource1.paginator = this.paginator;
    this.dataSource1.sort = this.sort;
    this.startdate.setValue(new Date(1527782400000));
    this.enddate.setValue(new Date());

    this.crops.setValue(null);
    this.sites.setValue(null);
    this.phLowValue = 0;
    this.phHighValue = 10;

    this.nLowValue = 0;
    this.nHighValue = 1;


    this.pLowValue = 0;
    this.pHighValue = 100;

    this.kLowValue = 0;
    this.kHighValue = 10;

    this.omLowValue = 0;
    this.omHighValue = 100;


    this.map.fitBounds(this.itemsLevel1.getBounds());
  }

  scrollToMap(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabClick(tab) {
    if (tab.index === 3) {
      this.selectedTab.setValue(3);
      this.filterboxid.nativeElement.classList.add('hidemenu');
      this.filterboxshow.nativeElement.classList.remove('hidemenu');
    }

  }

  showmenu() {
    this.filterboxshow.nativeElement.classList.add('hidemenu');
    this.filterboxid.nativeElement.classList.remove('hidemenu');
    this.selectedTab.setValue(0);
  }


}



@Component({
  selector: 'app-bottom-sheet-overview-example-sheet',
  templateUrl: 'bottom-sheet-overview-example-sheet.html',
  styleUrls: ['./app.component.css'],
})

export class BottomSheetOverviewExampleSheet {
  constructor(private bottomSheetRef: MatBottomSheetRef<BottomSheetOverviewExampleSheet>) { }

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
