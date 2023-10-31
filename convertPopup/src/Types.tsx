export interface Props {
    userId: number;
    popupId: number;
    }
    
    export type ChatGPT = {
    id: number;
    requestId: number;
    inputChatGPT: string;
    outputChatGPT: string;
    }
    

    
    export type Question = {
    id: number | null;
    text: string;
    multiSelection: boolean;
    answers: Answer[];
    };


    export type Answer = {
        question: number;
        id: number;
        text: string;
        next_question: Question | number;
        image: string;
        text_for_chatgpt: string;
        answerHasInputField: boolean;
        answerInputTextField: string;
        answerHasCallToAction: boolean;
        answerCallToActionURL: string;
        answerBorderColor: string ;  
        answerBackgroundColor: string ;  
        answerTextColor: string ;  
        answerBorderRadius: string ;  
        answerBorderBoxShadow: string ;  
        answerPadding: string ;  
        answerMargin: string ;
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
    id: number;
    popupAdditionalId: number;
    popupAdditionalText: string;
    popupAdditionalChatText: string;
    }

    export interface PopupPage {
        id: number;
        showOnWebsite: string;
      }
    
    export interface Popup {
    updateDate: string;
    id: number;
    alwaysDisplay: boolean;
    popupOrChat: string,
    activateOnExit: boolean, 
    activateOnInactivity: boolean,
    activateOnScroll: boolean,
    teaserText: string,
    teaserColor: string,
    teaserImage: string,
    teaserDescription: string,
    teaserButtonText: string,
    teaserHoverColor: string,
    teaserBackgroundGradient: string,
    teaserTextColor: string,
    questionnaire: number;
    status: boolean;
    name: string;
    popupLanguage: string;
    popupWordForAnd: string;
    popupType: number;
    popupGoal: number ;
    popupHeight: number;
    popupWidth: number;
    popupEmailSubscription: boolean;
    popupPromo: boolean;
    popupBorderRadius: string ;
    popupBorderBoxShadow: string ;
    popupImage: string ;
    popupImageBorderColor: string ;
    popupImageBorderWidth: string ;
    popupImageWidth: number ;
    popupImageHeight: number ;
    popupImageUrl: string ;
    popupHasLogo: boolean ;
    popupBackgroundColor: string ;
    popupBackgroundGradient: string ;
    popupBorderColor: string ;
    popupBorderWidth: string ;
    popupTitle: string ;
    popupTitleHeight: number ;
    popupTitleBgGradient: string ;
    popupTitleWidth: number ;
    popupTitlePositioning: number ;
    popupTitleTextColor: string ;
    popupTitleFontSize: string ;
    popupTitleFontWeight: string ;
    popupContentFontSize: string ;
    popupContentFontWeight: string ;
    popupChatHistoryFontSize: string ; 
    popupTextMarginLeft: number ;
    popupTextMarginRight: number ;
    popupContent: string ;
    popupContentHasBorder: boolean ;
    popupContentHeight: number ;
    popupContentWidth: number ;
    popupContentPositioning: number ;
    popupContentTextColor: string ;
    popupChatHistoryPositioning: number ;
    popupChatHistoryInputBoxColor: string ;
    popupChatHistoryOutputBoxColor: string ;
    popupChatHistoryTextSize: number ;
    popupChatHistoryBoxColor: string ;
    popupChatHistoryInputTextColor: string ;
    popupChatHistoryOutputTextColor: string  ;
    popupChatHistoryInputFocusBorderColor: string ;
    popupChatHistoryOutputFocusBorderColor: string ;
    popupChatButtonText: string ;
    popupChatButtonPositioning: number ;
    popupChatButtonTextColor: string ;
    popupChatButtonTextSize: number ;
    popupChatButtonBoxColor: string ;
    popupChatButtonFocusBorderColor: string ;
    popupChatStartMessage: string;
    popupChatFinishMessage: string;
    popupSuggestionButtonPositioning: number ;
    popupSuggestionButtonTextColor: string ;
    popupSuggestionButtonTextSize: number ;
    popupSuggestionButtonBoxColor: string ;
    popupSuggestionButtonFocusBorderColor: string ;
    popupCloseButtonText: string ;
    popupCloseButtonPositioning: number ;
    popupCloseButtonTextColor: string ;
    popupCloseButtonBoxColor: string ;
    popupCloseButtonVariantBoxColor: string ;
    popupCloseButtonColorScheme: string ;
    popupCloseButtonTextSize: string ;
    popupCloseButtonVariant: string ;
    popupCTAButtonText: string ;
    popupCTAButtonPositioning: number ;
    popupCTAButtonTextColor: string ;
    popupCTAButtonHeight: number ;
    popupCTAButtonWidth: number ;
    popupCTAButtonLink: string ;
    popupCTAButtonBorderColor: string ;
    popupCTAButtonHasBorder: boolean ;
    popupSendButtonColor: string ;
    popupSendButtonTextColor: string ;
    popupSendButtonText: string ;
    popupSendButtonVariant: string ;
    popupSendButtonScheme: string ;
    popupSendButtonBorderColor: string ;
    popupTitleAndContentPercentage : string ;
    popupChatHistoryPercentage: string ;
    popupChatSendPercentage: string ;
    popupCTAPercentage : string ;
    popupExampleInputChatGPT: string ;
    popupExampleOutputChatGPT: string ;  
    popupQuestionarySubmitButtonText : string ;  
    popupQuestionarySubmitButtonTextColor : string ;  
    popupQuestionarySubmitButtonColor : string ;  
    popupQuestionarySubmitBorderColor : string ;  
    popupQuestionarySubmitHasBorder : boolean ;  
    answerBorderColor : string ;  
    answerBackgroundColor : string ;  
    answerTextColor : string ;  
    answerBorderRadius: string ;  
    answerBorderBoxShadow: string ;  
    answerPadding: string ;  
    answerMargin: string ;
    }
    
    export type selectedAnswersType = {
        answerId: number, 
        customTextInput: string
    }[]



    export type chatGPTInformation = {
        companyName: string;
        whatServicesDoYouOfferToClients: string;
        moreInformationAboutYourProducts: string;
        howCanCustomersReachYouOrYourTeam: string;
        whatAreFAQs: string;
        anyOtherInformation: string;
        howMuchDiscountCanYouDoMaximum: string;
        whatAreYourMostSoldProductsAndTheirSpecs: string;
    }

    