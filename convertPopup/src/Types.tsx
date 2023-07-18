export interface Props {
id: number;
popupId: number;
}

export type ChatGPT = {
id: number;
requestId: number;
inputChatGPT: string;
outputChatGPT: string;
}

export type Answer = {
id: number;
text: string;
next_question: number | null;
image: string;
text_for_chatgpt: string;
answerHasInputField: boolean;
answerInputTextField: string;
answerHasCallToAction: boolean;
answerCallToActionURL: string;
answerBorderColor: string | null;  
answerBackgroundColor: string | null;  
answerTextColor: string | null;  
answerBorderRadius: string | null;  
answerBorderBoxShadow: string | null;  
answerPadding: string | null;  
answerMargin: string | null;
};

export type Question = {
id: number;
text: string;
answers: Answer[];
};


export type PopupEngagement = {
id: number;
popupEngagementId: number;
popupEngagementTitle: string;
popupEngagementEnd: string;
popupEngagementStart: string;
popupEngagementUniqueIdentifier: string;
}

export interface PopupAdditional {
popupAdditionalId: number;
popupAdditionalText: string;
popupAdditionalLink: string;
}

export interface Popup {
popupId: number;
popupType: number;
popupGoal: number | null;
popupHeight: number | null;
popupWidth: number | null;
popupEmailSubscription: boolean | null;
popupPromo: boolean | null;
popupBorderRadius: string | null;
popupBorderBoxShadow: string | null;
popupImage: string | null;
popupImageBorderColor: string | null;
popupImageBorderWidth: string | null;
popupImageWidth: number | null;
popupImageHeight: number | null;
popupHasLogo: boolean | null;
popupBackgroundColor: string | null;
popupBorderColor: string | null;
popupBorderWidth: string | null;
popupTitle: string | null;
popupTitleHeight: number | null;
popupTitleWidth: number | null;
popupTitlePositioning: number | null;
popupTitleTextColor: string | null;
popupTitleFontSize: string | null;
popupTitleFontWeight: string | null;
popupContentFontSize: string | null;
popupContentFontWeight: string | null;
popupChatHistoryFontSize: string | null; 
popupTextMarginLeft: number | null;
popupTextMarginRight: number | null;
popupContent: string | null;
popupContentHasBorder: boolean | null;
popupContentHeight: number | null;
popupContentWidth: number | null;
popupContentPositioning: number | null;
popupContentTextColor: string | null;
popupChatHistoryPositioning: number | null;
popupChatHistoryInputBoxColor: string | null;
popupChatHistoryOutputBoxColor: string | null;
popupChatHistoryTextSize: number | null;
popupChatHistoryBoxColor: string | null;
popupChatHistoryInputTextColor: string | null;
popupChatHistoryOutputTextColor: string  | null;
popupChatHistoryInputFocusBorderColor: string | null;
popupChatHistoryOutputFocusBorderColor: string | null;
popupChatButtonText: string | null;
popupChatButtonPositioning: number | null;
popupChatButtonTextColor: string | null;
popupChatButtonTextSize: number | null;
popupChatButtonBoxColor: string | null;
popupChatButtonFocusBorderColor: string | null;
popupSuggestionButtonPositioning: number | null;
popupSuggestionButtonTextColor: string | null;
popupSuggestionButtonTextSize: number | null;
popupSuggestionButtonBoxColor: string | null;
popupSuggestionButtonFocusBorderColor: string | null;
popupCloseButtonText: string | null;
popupCloseButtonPositioning: number | null;
popupCloseButtonTextColor: string | null;
popupCloseButtonBoxColor: string | null;
popupCloseButtonVariantBoxColor: string | null;
popupCloseColorScheme: string | null;
popupCloseButtonTextSize: string | null;
popupCloseButtonVariant: string | null;
popupCTAButtonText: string | null;
popupCTAButtonPositioning: number | null;
popupCTAButtonTextColor: string | null;
popupCTAButtonHeight: number | null;
popupCTAButtonWidth: number | null;
popupCTAButtonLink: string | null;
popupCTAButtonBorderColor: string | null;
popupCTAButtonHasBorder: boolean | null;
popupSendButtonColor: string | null;
popupSendButtonTextColor: string | null;
popupSendButtonText: string | null;
popupSendButtonVariant: string | null;
popupSendButtonColorScheme: string | null;
popupTitleAndContentPercentage : string | null;
popupChatHistoryPercentage: string | null;
popupChatSendPercentage: string | null;
popupCTAPercentage : string | null;
popupExampleInputChatGPT: string | null;
popupExampleOutputChatGPT: string | null;  
popupQuestionarySubmitButtonText : string | null;  
popupQuestionarySubmitButtonTextColor : string | null;  
popupQuestionarySubmitButtonColor : string | null;  

answerBorderColor : string | null;  
answerBackgroundColor : string | null;  
answerTextColor : string | null;  
answerBorderRadius: string | null;  
answerBorderBoxShadow: string | null;  
answerPadding: string | null;  
answerMargin: string | null;
}
