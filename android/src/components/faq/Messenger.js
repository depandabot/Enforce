import React, { Component } from 'react';
import {
	AsyncStorage,
	Text,
	Modal,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput';
import PropTypes from 'prop-types';

import { sendFeedback } from '../../../../includes/firebase/database';
import StaticNavigation from '../navigation/StaticNavigation'
import Done from '../timerList/Done';
import {
	messageContainerHeight,
	primaryBlue,
} from '../../styles/common';

export default class Messenger extends Component {
	constructor() {
		super();
		this.email = '';
		this.feedback = {};
		this.message = '';
	}

	render() {
		return (
			<Modal
				animationType={'fade'}
				onRequestClose={() => this.props.closeMessenger()}
				visible={this.props.visibility}
			>
				<StaticNavigation 
					closeModal={this.props.closeMessenger}
					title={'Feedback'}
				/>
				<ScrollView	style={styles.scrollView}>
					<View style={styles.inputContainer}>
						<AutoGrowingTextInput
							style={styles.textInput}
							onChangeText={(text) => this._handleTextInput(text)}
							underlineColorAndroid={'white'}
							autoCorrect={false}
							autoCapitalize={'sentences'}
							fontSize={26}
							maxLength={365}
							minHeight={120}
							autoFocus={true}
							placeholder={'We appreciate your feedback!'}
						/>
					</View>
				</ScrollView>
				<Done 
					text={'Send'}
					closeModal={this.sendFeedbackToFirebase.bind(this)}
				/>
			</Modal>
		);
	}

	componentDidMount() {
		this._getUserInfo();
	}

	async _getUserInfo() {
		var profile = await AsyncStorage.getItem('@Enforce:profileSettings');
		profile = JSON.parse(profile);
		this.email = this._parseEmail(profile.email);
		this.feedback.county = profile.county;
		this.feedback.date = new Date() + '';
	}

	sendFeedbackToFirebase() {
		if (this.message.length === 0) {
			this.props.closeMessenger();
		} else {
			this.feedback.message = this.message.replace(/\W/g, " ");
			if (this.email) {
				sendFeedback(this.email, this.feedback);
			} else {
				sendFeedback(this.feedback.date, this.feedback);
			}
		}
		// Say thank you
		this.props.closeMessenger('thanks');
	}

	_parseEmail(email) {
		var result = email.replace('@', ' AT ');
		result = result.replace('.', ' DOT ');
		return result;
	}

	_handleTextInput(e) {
		this.message = e;
	}

}

Messenger.propTypes = {
	closeMessenger: PropTypes.func.isRequired,
	visibility: PropTypes.bool.isRequired,
}

const styles = StyleSheet.create({
	scrollView: {
		alignSelf: 'stretch',
		backgroundColor: primaryBlue,
		paddingTop: '5%',
	},	
	inputContainer: {		
		height: messageContainerHeight,
		marginLeft: '5%',
		marginRight: '10%',
	},
	textInput: {
		color: 'white',
	}
});