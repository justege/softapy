import { Props, ChatGPT, PopupEngagement, PopupAdditional , Popup, Question, selectedAnswersType, PopupPage, RecommendedProduct } from './Types'

export type ReducerState = {
    popupEngagement?: PopupEngagement;
    popupAdditionals: PopupAdditional[];
    recommendedProducts: RecommendedProduct[];
    popup?: Popup;
    error?: unknown;
    chatGPTs: ChatGPT[];
    inputChatGPT: string;
    pastChatGPTInput: string[];
    allQuestions: Question[] | [];
    selectedAnswers: selectedAnswersType;
    popupCreationState: boolean;
    questionStartTime: number | null;
    question: Question | null;
}

export const initialState: ReducerState = {
    popupEngagement: undefined,
    popupAdditionals: [],
    recommendedProducts: [],
    popup: undefined,
    error: undefined,
    chatGPTs: [],
    inputChatGPT: '',
    pastChatGPTInput: [''],
    allQuestions: [],
    selectedAnswers: [],
    popupCreationState: false,
    questionStartTime: null,
    question: null,
}

export type ReducerDispatchAction = 
| { type: 'setPopupEngagement'; payload?: PopupEngagement}
| { type: 'setPopupAdditionals'; payload: PopupAdditional[]}
| { type: 'setPopup'; payload?:Popup}
| { type: 'setError'; payload?:unknown}
| { type: 'setChatGPTs'; payload?: ChatGPT[]}
| { type: 'setRecommendedProducts'; payload?: RecommendedProduct[]}
| { type: 'setInputChatGPT'; payload?:string}
| { type: 'setPastChatGPTInput'; payload?:string[]}
| { type: 'setAllQuestions'; payload:Question[] | []}
| { type: 'setQuestion'; payload: Question | null}
| { type: 'setSelectedAnswers'; payload?: selectedAnswersType}
| { type: 'toggleAnswer'; payload: { answerId: number; customTextInput: string }}
| { type: 'setPopupCreationState'; payload?:boolean}
| { type: 'setQuestionStartTime'; payload:number | null}



export function theStateReducer(state: ReducerState, action: ReducerDispatchAction): ReducerState {

    switch(action.type) {
        case 'setPopupEngagement': {
            return { ...state, popupEngagement: action.payload };
        }
        case 'setPopupAdditionals': {
            return { ...state, popupAdditionals: action.payload };
        }
        case 'setPopup': {
            return { ...state, popup: action.payload };
        }
        case 'setError': {
            return { ...state, error: action.payload };
        }
        case 'setChatGPTs': {
            return { ...state, chatGPTs: action.payload || [] };
        }
        case 'setRecommendedProducts': {
            return { ...state, recommendedProducts: action.payload || [] };
        }
        case 'setInputChatGPT': {
            return { ...state, inputChatGPT: action.payload || '' };
        }
        case 'setPastChatGPTInput': {
            return { ...state, pastChatGPTInput: action.payload || [] };
        }
        case 'setAllQuestions': {
            return { ...state, allQuestions: action.payload };
        }
        case 'setQuestion': {
            return { ...state, question: action.payload };
        }
        case 'setSelectedAnswers': {
            return {
                ...state,
                selectedAnswers: action.payload || []
            };
        }
        case 'toggleAnswer': {

            const isSelected = state.selectedAnswers.some((e) => e.answerId === action.payload.answerId);

            const answerId = action.payload.answerId ?? 0;
            const customTextInput = action.payload.customTextInput ?? ''



            return {
                ...state,
                selectedAnswers: isSelected
                    ? state.selectedAnswers.filter((selectedAnswer) => selectedAnswer.answerId !== action.payload.answerId)
                    : [...state.selectedAnswers, { answerId, customTextInput }],
            };
        }
        case 'setPopupCreationState': {
         
            return { ...state, popupCreationState: action.payload || false };
        }
        case 'setQuestionStartTime': {
            return { ...state, questionStartTime: action.payload };
        }
        default:
            return state;
    }
}
