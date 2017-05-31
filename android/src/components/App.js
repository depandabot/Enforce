import React, { Component } from 'react';
import { DrawerNavigator } from 'react-navigation';
import { Provider } from 'react-redux';
import RNFS from 'react-native-fs';
import { CameraApp } from './camera/CameraApp';
import MapApp from './map/MapApp';
import Home from './home';
import Profile from './profile';
import TimerList from './timerList';
import VINSearch from './search';
import History from './history';
import Metrics from './metrics';
import FAQs from './faq';
import Realm from 'realm';
import Schema from '../realm';
import Firebase from '../../../includes/firebase/firebase';

Firebase.initialize();

const AppNavigator = DrawerNavigator({
  Home: {
    screen: Home
  },
  Profile: {
    screen: Profile
  },
  Map: {
    screen: MapApp
  },
  Camera: {
    screen: CameraApp
  },
  Timers: { //Cannot navigate to page w/o passing params
    screen: TimerList
  },
  "VIN Search": {
    screen: VINSearch
  },
  History: {
    screen: History
  },
  Metrics: {
    screen: Metrics
  },
  FAQs: {
    screen: FAQs
  }
});


export default class App extends Component {
  render() {

    // Realm.clearTestState(); // Uncomment to drop/recreate database

       this.realm = new Realm({schema: Schema});

    // this.realm.write(() => {
    // this.realm.create('TimerSequence', {timeAccessedAt: new Date() / 1000, count: 0});
    // this.realm.create('TimeLimit', {float: 1, hour: '1', minutes: "00"});
    // this.realm.create('Coordinates', {latitude: 0, longitude: 0});
    //  this.realm.create('Ticketed', {list: []});
    //  this.realm.create('Expired', {list: []});
    // }); // For beta testing only TODO remove this


    let timerLists = this.realm.objects('Timers');
    if (timerLists.length > 1) { // Initializing Timers automatically gives it a length of 1 with an empty list object
      let i = 0, lastTime;
      while (lastTime === undefined && timerLists[i + 1]) { // Edge case for empty first object
        if (timerLists[i].list.length > 0) lastTime = timerLists[i].list[0].createdAt;
        i++;
      }
      let context = this;
      let now = new Date() / 1000;
      if (now - lastTime > 28800) { // Reset DB after 8 hours of activity
        this._loopDeletion(timerLists);
        console.log('deletion')
        //TODO Doesn't wait..
        setTimeout(() => {
          console.log('DELETE')
          Realm.clearTestState();
          this.realm = new Realm({schema: Schema});
          this.realm.write(() => {
            this.realm.create('TimerSequence', {timeAccessedAt: new Date() / 1000, count: 0});
            this.realm.create('TimeLimit', {float: 1, hour: '1', minutes: "00"});
            this.realm.create('Coordinates', {latitude: 0, longitude: 0});
            this.realm.create('Ticketed', {list: []});
            this.realm.create('Expired', {list: []});
          });
        }, 1000);
      }
    }

    return (
        <AppNavigator/>
    );
  }

  _loopDeletion(timerLists) {
    timerLists.forEach((timerList, idx) => {
      timerList.list.forEach((timer, sidx) => {
        RNFS.unlink(timer.mediaPath)
        .then(() => {
          console.log('FILE DELETED');
          RNFS.exists(timer.mediaUri)
          .then(() => {
            console.log('PICTURE REMOVED');
            this.realm.write(() => {
              //timerLists[idx]['list'].pop();
              this.realm.delete(timerLists[idx]['list'][sidx]);
            });
          });
        });
      });
    });
  }
}
