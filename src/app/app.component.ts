import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Map, latLng, tileLayer, marker, LayerGroup, control } from 'leaflet';
import { AngularFireDatabase, AngularFireDatabaseModule } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { MatTable, MatTableDataSource } from '@angular/material';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SoilIcons } from './markers'



export interface SoilSample {
  id: number;
  crop: string;
  ph: string;
  om: string;
  n: string;
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

  displayedColumns: string[] = ['barangay', 'crop', 'ph', 'om', 'n', 'p', 'k'];
  SOIL_DATA: SoilSample[] = [];
  dataSource1 = new MatTableDataSource<SoilSample>();
  map;
  // array from firestore
  items: Observable<any[]>;

  markers: SoilIcons = new SoilIcons();

  crops = new FormControl();
  cropList: string[] = ['Rice', 'Corn', 'Cacao/Coffee', 'Sugarcane', 'Tomato', 'Banana', 'Soybean'];

  sites = new FormControl();
  // tslint:disable-next-line:max-line-length
  siteList: string[] = ['Laguna', 'Albay', 'Ilocos Norte', 'Oriental Mindoro', 'Nueva Ecija', 'Isabela', 'North Cotabato', 'Misamis Oriental', 'Cebu', 'Bukidnon', 'Iloilo'];

  siteFilter = [];
  cropFilter = [];


  // layergroup for each crop type
  itemsLevel1: LayerGroup = new LayerGroup();

  // main layergroup
  layerMainGroup: LayerGroup[] = [];

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
    center: latLng([12.6, 121.726909])
  };


  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(db: AngularFireDatabase) {

    this.items = db.list('items').valueChanges();

    const myObserver = {
      next: x => {
        x.forEach(sample => {

          let flag = false;
          if (sample.url.length > 0) {
            flag = true;
          };


          const tempObject = {
            // insert the id too
            id: sample.id,
            crop: sample.crop,
            ph: sample.ph,
            om: sample.om,
            n: sample.n,
            p: sample.p,
            p_analysis: sample.p_analysis,
            k: sample.k,
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

    items.forEach(samplepoint => {

      console.log(samplepoint.crop + this.markers.iconList[samplepoint.crop]);
      const regularIcon = this.markers.iconList[samplepoint.crop].regular;
      const biggerIcon = this.markers.iconList[samplepoint.crop].big;


      // tslint:disable-next-line:max-line-length
      const tempMarker = marker([samplepoint.lat, samplepoint.long], { icon: regularIcon });

      // tslint:disable-next-line:max-line-length
      const popupContent = '<span style=\'font-size:1.5em;font-weight:500;\'>' + samplepoint.crop + '</span><br>' + samplepoint.barangay + '<br>N: ' + samplepoint.n + '<br>P: ' + samplepoint.p + '<br>K: ' + samplepoint.k + '<br>Organic Matter: ' + samplepoint.om;

      tempMarker.bindPopup(popupContent);

      tempMarker.on('mouseover', e => {
        e.target.setIcon(biggerIcon);
        e.target.setZIndexOffset('1000');
        console.log(biggerIcon);
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


    const res = cropres.filter(v => { // iterate over the array
      // check sample present in the second array
      return siteres.indexOf(v) > -1;
      // or array2.includes(v)
    });

    // make the markers
    this.itemsLevel1.clearLayers();
    this.dataSource1 = new MatTableDataSource(res);
    this.dataSource1.paginator = this.paginator;
    this.dataSource1.sort = this.sort;
    this.createMarkers(res);
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

}

// layer control. keep an array or list of active layers, then rebuild the layerMainGroup everytime the list changes
// https://www.google.com/search?q=%27&oq=%27&aqs=chrome..69i57.2j0j4&sourceid=chrome&ie=UTF-8
