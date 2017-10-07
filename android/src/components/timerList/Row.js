import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationActions } from'react-navigation';
import PhotoView from 'react-native-photo-view';
import PropTypes from 'prop-types';

import {
  extraLargeFontSize,
  largeFontSize,
  mediumFontSize,
  primaryBlue,
  smallFontSize,
  timerRowButtonsContainerHeight,
  timerRowDescContainerHeight,
  timerRowImageHeight,
} from '../../styles/common';


export default class Row extends Component {
  constructor() {
    super();
    this.licenseButtonPressed = 0;
  }

  render() {
    if (this.props.data.createdAt === 0) return <View/>
    return (
      <View style={styles.container} >
        <View style={{height: timerRowImageHeight, backgroundColor: 'black'}}>
          <PhotoView
            style={styles.image}
            source={{uri: this.props.data.mediaUri}}
            androidScaleType="fitCenter"
          />
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.timeLeft}>{this._getTimeLeft(this.props.data)}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.description}>Recorded at</Text>
            <Text style={styles.timeCreatedAt}>{this._getPrettyTimeFormat(this.props.data.createdAt)}</Text>
          </View>
        </View>
        { this.props.data.description ?
          <View style={styles.locationContainer}>
            <TouchableOpacity 
              activeOpacity={.9}
              onPress={() => this._openMapPage(this.props.data.index)}
            >
              <Text style={styles.location}>{ `${this.props.data.description}` }</Text>
            </TouchableOpacity>
          </View>
          : null }
        { this.props.data.license ?
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.licenseContainer} 
            onPress={() => {
              this.props.enterLicenseInSearchField({license: this.props.data.license, listIndex: this.props.data.index});
            }}
          >
            <Text style={styles.license}>{this.props.data.license}</Text>
          </TouchableOpacity>
          : null }
        <View style={styles.buttonsContainer} >
          <View style={styles.rowButtonsContainers} >
            <TouchableOpacity
              style={styles.rowButton}
              activeOpacity={.9}
              onPress={() => this.props.expiredFunc(this.props.data)} >
              <Text style={styles.buttonText}> Expired </Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.rowButton}
              activeOpacity={.9}
              onPress={() => this.props.uponTicketed(this.props.data)}>
              <Text style={styles.buttonText}> Ticketed </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  _getPrettyTimeFormat(createdAt: number): string {
    let date = new Date(createdAt);
    let hour = date.getHours();
    let minutes = date.getMinutes() + '';
    minutes = minutes.length === 1 ? '0' + minutes : minutes;
    let period = (hour < 12) ? 'AM' : 'PM';
    hour = (hour <= 12) ? hour : hour - 12;
    return `${hour}:${minutes} ${period}`;
  }

  _getTimeLeft(timer: object): object {
    if (!timer) return;
    let timeLength = timer.timeLength * 60 * 60 * 1000;
    let timeSince = new Date() - timer.createdAt;
    let timeLeft = (timeLength - timeSince) / 1000;
      if (timeLeft < 0) {
      return <Text style={styles.timeUp}>Time is up!</Text>;
    } else if (timeLeft < 60) {
      return<Text style={styles.timeUp}>less than a minute {'\n'}remaining</Text>;
    } else if (timeLeft < 3600) {
      if (timeLeft < 300 ) return <Text style={styles.timeUp}> {Math.floor(timeLeft / 60) === 1 ? '1 minute remaining' : Math.floor(timeLeft / 60) + ' minutes remaining'}</Text>;
      if (timeLeft < 3600 / 4) return <Text style={styles.timeUp}> {Math.floor(timeLeft / 60) === 1 ? '1 minute remaining' : Math.floor(timeLeft / 60) + ' minutes remaining'}</Text>;
      return <Text style={styles.timeUpNear}> {Math.floor(timeLeft / 60) === 1 ? '1 minute remaining' : Math.floor(timeLeft / 60) + ' minutes remaining'}</Text>;
    } else if (timeLeft > 3600) {
      return <Text style={styles.timeUpFar}>{Math.floor(timeLeft / 60 / 60)} hour {Math.floor((timeLeft % 3600) / 60)} minutes remaining</Text>;
    } else {
      return '';
    }
  }

  _openMapPage(timersIndex: number): undefined {
    const navigateAction = NavigationActions.navigate({
      routeName: 'Map',
      params: {
        timersIndex, 
        navigation: this.props.navigation,
        timerCreatedAt: this.props.data.createdAt,
      },
    });
    this.props.navigation.dispatch(navigateAction);
  }
}

Row.propTypes = {
  data: PropTypes.object.isRequired,
  enterLicenseInSearchField: PropTypes.func.isRequired,
  expiredFunc: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  uponTicketed: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex:1,
    height: undefined,
    width: undefined,
  },
  licenseContainer: {
    position: 'absolute',
    // Position the License Container above both the Description Container and the Buttons Container minus the border width
    bottom: timerRowDescContainerHeight + timerRowButtonsContainerHeight - 2,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: primaryBlue,
    borderLeftColor: primaryBlue,
    borderRightColor: primaryBlue,
    borderBottomColor: 'white',
  },
  license: {
    fontSize: mediumFontSize,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: '1%',
    paddingLeft: '3%',
    paddingRight: '3%',
  },
  timeUp: {
    fontSize: largeFontSize,
    fontWeight: 'bold',
    color:'green',
  },
  timeUpFar: {
    fontSize: smallFontSize,
    fontWeight: 'bold',
  },
  timeUpNear: {
    fontSize: mediumFontSize,
    fontWeight: 'bold',
    color: primaryBlue,
  },
  buttonsContainer: {
    alignSelf: 'stretch',
  },
  rowButtonsContainers: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: 'white',
    height: timerRowButtonsContainerHeight,
  },
  rowButton: {
    flex: .5,
    backgroundColor: primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    borderColor: 'white',
    borderWidth: .5,
  },
  buttonText: {
    fontSize: largeFontSize,
    color: 'white',
  },
  descriptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: timerRowDescContainerHeight,
    padding: '4%',
    borderTopWidth: 2,
    borderTopColor: primaryBlue,
  },
  timeContainer: {
    flexDirection: 'column',
  },
  timeCreatedAt: {
    color: primaryBlue,
    fontSize: extraLargeFontSize,
  },
  locationContainer: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'white',
    width: '100%',
  },
  location: {
    textAlign: 'center',
    color: primaryBlue,
    fontSize: mediumFontSize,
    paddingLeft: '4%',
    paddingRight: '4%',
    paddingBottom: '1%',
    paddingTop: '1%',
  },
});
