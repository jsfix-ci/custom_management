import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private http: HttpClient) { }

  getStoreSettings() {
    return JSON.parse(localStorage.getItem('storeSettings'));
  }

  setStoreSettings(data) {
    localStorage.setItem('storeSettings', JSON.stringify(data));
  }
}