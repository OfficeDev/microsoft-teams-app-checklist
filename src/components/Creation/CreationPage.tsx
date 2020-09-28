// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import { ChecklistGroupType } from "../../utils";
import { ChecklistItemsContainer } from "../ChecklistItemsContainer";
import {
	callActionInstanceCreationAPI,
	addChoice,
	deleteChoice,
	updateTitle,
	updateChoiceText,
	changeItemCheckedStatus,
} from "../../actions/CreationActions";
import "../Creation/Creation.scss";
import getStore from "../../store/CreationStore";
import { observer } from "mobx-react";
import {
	Flex,
	Text,
	FlexItem,
	AddIcon,
	Button,
	Loader
} from "@fluentui/react-northstar";
import { Localizer } from "../../utils/Localizer";
import { Utils } from "../../utils/Utils";
import { UxUtils } from "../../utils/UxUtils";
import { ProgressState } from "../../utils/SharedEnum";
import { ErrorView } from "../ErrorView";
import { InputBox } from "../InputBox";
import { ActionSdkHelper } from "../../helper/ActionSdkHelper";
import { Constants } from "../../utils/Constants";

@observer
export default class CreationPage extends React.Component<any, any> {
	private checklistItemsRef;
	private checklistTitleRef: HTMLElement;

	constructor(props) {
		super(props);
		this.checklistItemsRef = React.createRef();
	}

	componentDidUpdate() {
		// If user presses send/create checklist button without filling checklist title, focus should land on title edit field.
		if (getStore().showBlankTitleError && this.checklistTitleRef) {
			this.checklistTitleRef.focus();
		}
	}

	render() {
		let progressState = getStore().progressState;
		if (progressState === ProgressState.NotStarted || progressState == ProgressState.InProgress) {
			return <Loader />;
		} else if (getStore().progressState === ProgressState.Failed) {
			ActionSdkHelper.hideLoadIndicator();
			return (
				<ErrorView
					title={Localizer.getString("GenericError")}
					buttonTitle={Localizer.getString("Close")}
				/>
			);
		} else {
			ActionSdkHelper.hideLoadIndicator();
			if (UxUtils.renderingForMobile()) {
				return (
					<Flex className="body-container no-mobile-footer">
						{this.renderChecklistSection()}
						<div className="settings-summary-mobile-container">
							{this.renderFooterSection()}
						</div>
					</Flex>
				);
			} else {
				return (
					<>
						<Flex className="body-container" column>
							{this.renderChecklistSection()}
						</Flex>
						{this.renderFooterSection()}
					</>
				);
			}
		}
	}

	renderChecklistSection() {
		let accessibilityAnnouncementString: string = "";
		if (getStore().showBlankTitleError) {
			accessibilityAnnouncementString = Localizer.getString("BlankTitleError");
		}
		Utils.announceText(accessibilityAnnouncementString);
		return (
			<div className="checklist-section">
				<InputBox
					inputRef={(element: HTMLElement) => {
						this.checklistTitleRef = element;
					}}
					fluid
					multiline
					maxLength={240}
					className="title-container"
					input={{
						className: "title-box",
					}}
					defaultValue={getStore().title}
					key="title-box"
					placeholder={Localizer.getString("NameYourChecklist")}
					showError={getStore().showBlankTitleError}
					errorText={
						getStore().showBlankTitleError
							? Localizer.getString("BlankTitleError")
							: null
					}
					onBlur={(e) => {
						updateTitle((e.target as HTMLInputElement).value);
					}}
				/>
				<ChecklistItemsContainer
					ref={(child) => (this.checklistItemsRef = child)}
					sectionType={ChecklistGroupType.All}
					items={getStore().items}
					closed={false}
					expired={false}
					onToggleDeleteItem={(i) => {
						deleteChoice(i);
					}}
					onItemChecked={(i, value) => {
						changeItemCheckedStatus(i, value);
					}}
					onItemAdded={() => {
						this.onAddChoice();
					}}
					onUpdateItem={(i, value) => {
						updateChoiceText(i, value);
					}}
				/>
				<div
					id={Constants.ADD_ITEM_DIV_ID}
					className="add-options-cl"
					{...UxUtils.getTabKeyProps()}
					onClick={() => {
						this.onAddChoice();
					}}
				>
					<AddIcon outline size="medium" color="brand" />
					<Text
						className="add-options-cl-label"
						content={Localizer.getString("AddRow")}
						color="brand"
					/>
				</div>
				{/* Adding a pseudo-element so that add items button can scroll to the bottom */}
				<div
					id="pseudo-element"
					className="pseudo-element"
					aria-hidden="true"
				/>
			</div>
		);
	}

	renderFooterSection() {
		let buttonText: string = Localizer.getString("SendChecklist");
		buttonText = Localizer.getString("Next");
		return (
			<Flex className="footer-layout" gap="gap.small">
				<FlexItem push>
					<Button
						primary
						content={buttonText}
						loading={getStore().isSending}
						disabled={getStore().isSending}
						onClick={() => {
							callActionInstanceCreationAPI();
						}}
					/>
				</FlexItem>
			</Flex>
		);
	}

	private onAddChoice() {
		addChoice();
		this.checklistItemsRef.getFocusToLastElement();
		if (!UxUtils.renderingForiOS()) {
			document.getElementById("pseudo-element").scrollIntoView();
		}
	}

}
