import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  useReducer,
} from "react";
import {
  Box as ChakraBox,
  Button as ChakraButton,
  Flex,
  Button,
  useBreakpointValue,
  Icon,
  Text,
  Avatar,
  Center,
  keyframes,
  Divider,
  VStack,
  StackDivider,
  Img,
  Radio,
} from "@chakra-ui/react";
import { baseUrl } from "./shared";
import { Props, PopupPage } from "./Types";
import { useForm } from "react-hook-form";
import { QuestionaireInChat } from "./QuestionaireInChat";
import { initialState, theStateReducer } from "./Reducer";
import { Questionnaire } from "./Questionnaire";
import {
  ArrowRightIcon,
  CheckIcon,
  LinkIcon,
  MinusIcon,
  TimeIcon,
} from "@chakra-ui/icons";

const shockwaveAnimation = keyframes`
0% {
  transform: scale(1);
  box-shadow: 0 0 2px #27ae60;
  opacity: 1;
}
25% {
  transform: scale(1.05);
  opacity: 1; /* Adjust the opacity to control the fade */
}
50% {
  transform: scale(1.0);
  opacity: 1; /* Adjust the opacity to control the fade */
}
75% {
  transform: scale(0.98);
  opacity: 1; /* Adjust the opacity to control the fade */
}
100% {
  transform: scale(1.0);
  opacity: 1; /* Adjust the opacity to control the fade */
}
`;

type FieldValues = {
  questionId: {
    [key: string]: string;
  };
};

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

// New function to increment the site visit count in cookies
function incrementSiteVisitCount() {
  const siteVisitCountCookie = getCookie("siteVisitCount");
  let count = 1;

  if (siteVisitCountCookie) {
    count = parseInt(siteVisitCountCookie, 10) + 1;
  }

  // Set the updated count in cookies
  document.cookie = `siteVisitCount=${count}`;
}

const SendIcon = (props: any) => (
  <Icon viewBox="0 0 64 64" {...props}>
    <path
      fill="black"
      d=" M 8.216 36.338 L 26.885 32.604 C 28.552 32.271 28.552 31.729 26.885 31.396 L 8.216 27.662 C 7.104 27.44 6.021 26.356 5.799 25.245 L 2.065 6.576 C 1.731 4.908 2.714 4.133 4.259 4.846 L 61.228 31.139 C 62.257 31.614 62.257 32.386 61.228 32.861 L 4.259 59.154 C 2.714 59.867 1.731 59.092 2.065 57.424 L 5.799 38.755 C 6.021 37.644 7.104 36.56 8.216 36.338 Z "
    />
  </Icon>
);

function ConvertPopup({ userId, popupId }: Props) {
  const showPopupButton = document.getElementById("showPopupButton");
  const { control, watch, reset } = useForm<FieldValues>();
  const csrfToken = getCookie("csrftoken");
  const headers = useMemo(() => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    if (csrfToken) {
      headers.append("X-CSRFToken", csrfToken);
    }
    return headers;
  }, [csrfToken]);

  const [theReducerState, setTheReducerState] = useReducer(
    theStateReducer,
    initialState
  );
  const {
    popupEngagement,
    popupAdditionals,
    popup,
    error,
    chatGPTs,
    inputChatGPT,
    pastChatGPTInput,
    allQuestions,
    question,
    selectedAnswers,
    popupCreationState,
    questionStartTime,
    recommendedProducts,
  } = theReducerState;
  const [pastChatGPTOutput, setPastChatGPTOutput] = useState<string[]>([
    question?.text ?? "",
  ]);
  const [showTeaserButtonOnScreen, setShowTeaserButton] = useState(false);
  const [isAllowedToCloseTeaser, setIsAllowedToCloseTeaser] = useState<{
    time: any;
    state: Boolean;
  }>();
  const [imageLoaded, setImageLoaded] = useState(false); // State to track image loading
  const [isLoadingThreeWave, setIsLoadingThreeWave] = useState(false); // State to track image loading
  const [
    finalTextForProductRecommendingRequest,
    setFinalTextForProductRecommendingRequest,
  ] = useState(" ");

  showPopupButton?.addEventListener("click", function () {
    setTheReducerState({ type: "setPopupCreationState", payload: true });
    setTheReducerState({ type: "setQuestionStartTime", payload: Date.now() });
  });

  const fetchPopup = async () => {
    try {
      const response = await fetch(`${baseUrl}/popup/${popupId}/${userId}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          conversationStartedAtWebsiteLink: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error("Something went wrong, try again later");
      }
      const data = await response.json();
      setTheReducerState({
        type: "setPopupEngagement",
        payload: data.customer,
      });
      setTheReducerState({ type: "setPopup", payload: data.popup });
      setTheReducerState({ type: "setQuestionStartTime", payload: Date.now() });
      setTheReducerState({ type: "setQuestion", payload: data.question });

      const recommendedProductsFromQuery = data.recommendedProducts


      if (pastChatGPTInput.length < 2) {
        setTheReducerState({
          type: "setRecommendedProducts",
          payload: recommendedProductsFromQuery,
        });
      }
      

      setTheReducerState({
        type: "setPastChatGPTInput",
        payload: [popup?.popupChatStartMessage ?? "Lets Start"],
      });
      setTheReducerState({
        type: "setAllQuestions",
        payload: data.allQuestions,
      });
      setPastChatGPTOutput([data.question.text]);
      setTheReducerState({
        type: "setChatGPTs",
        payload: [
          {
            id: 0,
            inputChatGPT: "",
            outputChatGPT: data.question.text,
            requestId: 0,
          },
        ],
      });
      setTheReducerState({ type: "setError", payload: undefined });

      setTimeout(() => {
        setShowTeaserButton(true);
      }, 3000);
    } catch (error) {
      setTheReducerState({ type: "setError", payload: error });
    }
  };

  const fetchPopupPages = async () => {
    const siteVisitCountCookie = getCookie("siteVisitCount");
    const siteVisitCount = siteVisitCountCookie
      ? parseInt(siteVisitCountCookie, 10)
      : 0;

    if (siteVisitCount >= 3) {
      // If the user has visited the site three times, don't show the popup
      return;
    }

    try {
      const responsePopupPages = await fetch(
        `${baseUrl}/api/popupPages/${popupId}/`
      );
      const data = await responsePopupPages.json();

      const regexPattern = data.popupPages
        .map((page: PopupPage) => {
          const escapedPage = page.showOnWebsite.replace(
            /[-/\\^$*+?.()|[\]{}]/g,
            "\\$&"
          );
          if (escapedPage.endsWith("/\\*")) {
            // If showOnWebsite ends with '/*', match the entire domain and all subpages
            return `(${escapedPage.replace(/\/\*$/, "(/.*)?")})`;
          } else {
            // Otherwise, match only the exact URL
            return `^${escapedPage}$`; // Add '^' and '$' for exact matching
          }
        })
        .join("|");

      const regex = new RegExp(`(${regexPattern})`);
      const currentURL = window.location.href;
      const regexResult = data.popupPages.some((page: PopupPage) =>
        regex.test(currentURL)
      );

      if (regexResult) {
        fetchPopup();
      }
    } catch (error) {
      // Handle errors here
      console.error("Error fetching Popup Pages:", error);
    }
  };

  useEffect(() => {
    fetchPopupPages();

    setTimeout(() => {
      setIsAllowedToCloseTeaser({ state: true, time: Date.now });
    }, 15000);
  }, []);

  const chatGPTConversationPostRequest = async (
    inputChatGPT: string,
    question_id?: number
  ) => {
    setIsLoadingThreeWave(true);
    try {
      const response = await fetch(
        `${baseUrl}/popup/postchatgpt/${userId}/${popupId}/${popupEngagement?.popupEngagementUniqueIdentifier}`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            inputChatGPT: inputChatGPT,
            next_question_id: question_id,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Something went wrong, try again later");
      }
      const data = await response.json();
      if (data.chatgpt.length > 0) {
        setTheReducerState({ type: "setChatGPTs", payload: data.chatgpt });

        const output = data.chatgpt.map((e: any) => e.outputChatGPT);
        setPastChatGPTOutput((oldState) => [...oldState, ...output]);
        setTheReducerState({ type: "setQuestion", payload: null });
        setTheReducerState({ type: "setAllQuestions", payload: [] });
        setTheReducerState({
          type: "setRecommendedProducts",
          payload: data.recommendedProducts,
        });
        setFinalTextForProductRecommendingRequest(" ");
      }
      setTheReducerState({ type: "setError", payload: undefined });
    } catch (error) {
      setTheReducerState({ type: "setError", payload: error });
      setTheReducerState({ type: "setChatGPTs", payload: [] });
    }

    setIsLoadingThreeWave(false);
  };

  const submitAnswerPostReqeust = async (
    inputChatGPT: string,
    question_id?: number
  ) => {
    try {
      const response = await fetch(
        `${baseUrl}/popup/submitAnswer/${userId}/${popupId}/${popupEngagement?.popupEngagementUniqueIdentifier}`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            inputChatGPT: inputChatGPT,
            next_question_id: question_id,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Something went wrong, try again later");
      }
      const data = await response.json();
      if (data.chatgpt.length > 0) {
        setTheReducerState({ type: "setChatGPTs", payload: data.chatgpt });
        //setTheReducerState({type: 'setRecommendedProducts', payload: data.recommendedProducts})
        //const output = data.chatgpt.map((e: any) => e.outputChatGPT)
        //setPastChatGPTOutput((oldState) => [...oldState, ...output])
      }
      setTheReducerState({ type: "setError", payload: undefined });
    } catch (error) {
      setTheReducerState({ type: "setError", payload: error });
      setTheReducerState({ type: "setChatGPTs", payload: [] });
    }
  };

  const submitAnswer = async () => {
    const questionInputFormWatch = watch("questionId");
    const combinedList = [
      ...theReducerState.selectedAnswers,
      ...(questionInputFormWatch
        ? Object.entries(questionInputFormWatch).map(([answerId, text]) =>
            text !== ""
              ? {
                  answerId: parseInt(answerId),
                  customTextInput: text ?? "",
                }
              : null
          )
        : []),
    ];

    postAnswer(combinedList, 0);
  };

  const postAnswer = async (combinedList: any, answerId: number) => {
    if (questionStartTime) {
      const answerTime = (Date.now() - questionStartTime) / 1000; // Calculate the time taken

      if (pastChatGPTInput.length > 0) {
        setTheReducerState({
          type: "setRecommendedProducts",
          payload: [],
        });
      }

      // Set the reducer states before making the fetch request
      setTheReducerState({ type: "setQuestionStartTime", payload: Date.now() });

      const nextQuestionIdOfChosenAnswer = allQuestions
        .find((e) => e.id == question?.id)
        ?.answers.find((f) => f.id == answerId)?.next_question;
      const nextQuestionOfChosenAnswer = allQuestions.find(
        (e) => e.id == nextQuestionIdOfChosenAnswer
      );

      setTheReducerState({
        type: "setQuestion",
        payload: nextQuestionOfChosenAnswer ?? null,
      });

      setPastChatGPTOutput((output) => [
        ...output,
        nextQuestionOfChosenAnswer?.text ?? "",
      ]);

      const and = popup?.popupWordForAnd;
      const stringValue: string = combinedList
        .map((e: any) => e?.customTextInput)
        .filter((e: any) => e !== "")
        .join(` ${and} `);

      submitAnswerPostReqeust(stringValue, nextQuestionOfChosenAnswer?.id ?? 0);

      setFinalTextForProductRecommendingRequest(
        (oldState) => oldState + ` ${question?.text} ${stringValue}. `
      );

      if (!nextQuestionIdOfChosenAnswer) {
        const newPastChatGPTInputValue = [
          ...pastChatGPTInput,
          ...[stringValue],
        ];

        const recommendingSentence =
          "Recommend me 3 different products paccording to following speficications DO NOT include any links:" +
          finalTextForProductRecommendingRequest;

        const recommendingSentenceShowingToPopup =
          "Please make product recommendations.";

        setTheReducerState({
          type: "setPastChatGPTInput",
          payload: [
            ...newPastChatGPTInputValue,
            ...[recommendingSentenceShowingToPopup],
          ],
        });

        chatGPTConversationPostRequest(recommendingSentence);
      } else {
        setTheReducerState({
          type: "setPastChatGPTInput",
          payload: [...pastChatGPTInput, ...[stringValue]],
        });
      }

      setTheReducerState({ type: "setSelectedAnswers", payload: [] });

      setIsAllowedToCloseTeaser({ state: true, time: null });
      reset();
    }
  };

  const toggleAnswer = (answerId: number, answerChatGPT: string) => {
    setTheReducerState({
      type: "toggleAnswer",
      payload: { answerId: answerId, customTextInput: answerChatGPT },
    });
    return { answerId, text: answerChatGPT };
  };

  const clickAnswer = (answerId: number, answerChatGPT: string) => {
    const isSelected = selectedAnswers.some((e) => e.answerId === answerId);
    const updatedAnswers = isSelected
      ? selectedAnswers.filter(
          (selectedAnswer) => selectedAnswer.answerId !== answerId
        )
      : [...selectedAnswers, { answerId, customTextInput: answerChatGPT }];

    postAnswer(updatedAnswers, answerId);

    return updatedAnswers;
  };

  const handleChatGPTSubmit = (questionId: number) => {
    if (inputChatGPT !== null) {
      setTheReducerState({
        type: "setPastChatGPTInput",
        payload: [...pastChatGPTInput, inputChatGPT],
      });
      chatGPTConversationPostRequest(inputChatGPT, questionId);
      //fetchChatGPTs();
      setTheReducerState({ type: "setInputChatGPT", payload: "" });
    }
  };

  const handleButtonSubmit = (ButtonInput: string) => {
    setTheReducerState({
      type: "setPastChatGPTInput",
      payload: [...pastChatGPTInput, ButtonInput],
    });

    chatGPTConversationPostRequest(ButtonInput);
    //fetchChatGPTs();
    setTheReducerState({ type: "setInputChatGPT", payload: "" });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const message = event.target.value;
    setTheReducerState({ type: "setInputChatGPT", payload: message });
  };

  useEffect(() => {
    if (popup?.activateOnScroll) {
      const handleScroll = () => {
        // Add your logic to determine when to show the popup after scrolling
        if (!popupCreationState && window.scrollY > 500) {
          setTheReducerState({ type: "setPopupCreationState", payload: true });
          setTheReducerState({
            type: "setQuestionStartTime",
            payload: Date.now(),
          });
        }
      };

      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [popupCreationState, popup?.activateOnScroll]);

  useEffect(() => {
    if (popup?.activateOnInactivity) {
      let inactivityTimeout: NodeJS.Timeout;

      const handleActivity = () => {
        clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(() => {
          // Add your logic to show the popup after inactivity
          if (!popupCreationState) {
            setTheReducerState({
              type: "setPopupCreationState",
              payload: true,
            });
            setTheReducerState({
              type: "setQuestionStartTime",
              payload: Date.now(),
            });
          }
        }, 10000);
      };

      window.addEventListener("mousemove", handleActivity);
      window.addEventListener("keydown", handleActivity);

      return () => {
        window.removeEventListener("mousemove", handleActivity);
        window.removeEventListener("keydown", handleActivity);
        clearTimeout(inactivityTimeout);
      };
    }
  }, [popupCreationState, popup?.activateOnInactivity]);

  useEffect(() => {
    if (popup?.activateOnExit) {
      const handleMouseOut = (event: MouseEvent) => {
        if (event.clientY <= 0 && !popupCreationState) {
          setTheReducerState({ type: "setPopupCreationState", payload: true });

          setTheReducerState({
            type: "setQuestionStartTime",
            payload: Date.now(),
          });
        }
      };

      window.addEventListener("mouseout", handleMouseOut);

      return () => {
        window.removeEventListener("mouseout", handleMouseOut);
      };
    }
  }, [popupCreationState, popup?.activateOnExit]);

  const left = useBreakpointValue({
    base: "2%",
    sm: "2%",
    md: "2%",
    lg: "2%",
    xl: "2%",
    "2xl": "2%",
  });
  const bottom = useBreakpointValue({
    base: "-10%",
    sm: "-10%",
    md: "-12%",
    lg: "-13%",
    xl: "-14%",
    "2xl": "-14%",
  });

  const handleImageLoad = () => {
    // This function is called when the image is successfully loaded
    setImageLoaded(true);
  };

  // Assuming pastChatGPTInput and pastChatGPTOutput have the same length
  const conversationHistory = pastChatGPTInput.map((input, index) => {
    return [
      { type: "input", text: input },
      { type: "output", text: pastChatGPTOutput[index] },
    ];
  });

  // Flatten the array to get a single array of conversation turns
  const flatConversationHistory = conversationHistory.flat();


  return (
    <>
      {!theReducerState.popupCreationState &&
        popup?.status &&
        showTeaserButtonOnScreen && (
          <ChakraBox
            rounded="2xl"
            position="fixed"
            backgroundColor={"blackAlpha.800"}
            padding={4}
            textColor={"white"}
            zIndex={"popover"}
            bottom="2%"
            left={left}
          >
            <Flex justifyItems={"top"} align={"top"} padding={0}>
              {popup?.teaserImage && (
                <Avatar
                  src={`${baseUrl}${popup?.teaserImage}`}
                  height={"40px"}
                  width={"40px"}
                  alignSelf={"center"}
                  style={{ display: imageLoaded ? "block" : "none" }} // Show if image is loaded
                  onLoad={handleImageLoad} // Call this function when the image is loaded
                />
              )}

              <ChakraBox padding={1}>
                {popup?.teaserDescription && (
                  <Text fontSize={"14px"}>
                    {popup?.teaserDescription ?? ""}
                  </Text>
                )}
                <Text fontSize={"20px"} fontWeight={"bold"}>
                  {popup?.teaserText ?? ""}
                </Text>

                <Flex justify={"center"} align={"center"} mt={3}>
                  <ChakraButton
                    id="showPopupButton"
                    rounded="2xl"
                    height="40px"
                    fontSize="20px"
                    _hover={{ bg: popup?.teaserHoverColor }}
                    bgGradient={popup?.teaserBackgroundGradient}
                    px={6}
                    variant="outline"
                    textColor={popup?.teaserTextColor}
                    onClick={() => {
                      setTheReducerState({
                        type: "setPopupCreationState",
                        payload: true,
                      });
                    }}
                  >
                    {popup?.teaserButtonText ?? ""}
                  </ChakraButton>
                </Flex>
              </ChakraBox>
              {isAllowedToCloseTeaser?.state && (
                <Button
                  size={"xs"}
                  colorScheme="black"
                  top={-3}
                  right={-3}
                  onClick={() => setShowTeaserButton(false)}
                >
                  X
                </Button>
              )}
            </Flex>
          </ChakraBox>
        )}

      {popupEngagement &&
        popupCreationState &&
        (popup?.status || popup?.alwaysDisplay) && (
          <>
            <ChakraBox
              zIndex={"popover"}
              position="fixed"
              bottom={popup?.popupOrChat === "Popup" ? bottom : undefined}
              top={popup?.popupOrChat === "Chatbot" ? "50%" : undefined}
              left={"50%"}
              transform="translate(-50%, -50%)"
            
            >
              {popup?.popupOrChat === "Chatbot" && (
                <Flex
                  direction="row"
                  w={popup?.popupWidth ?? [800, 550]}
                  h={popup?.popupHeight ?? [500, 350]}
                  bg={"white"}
                  border={popup?.popupBorderWidth ?? undefined}
                  borderColor={popup?.popupBorderColor ?? undefined}
                  borderRadius={popup?.popupBorderRadius ?? "0"}
                  boxShadow={popup?.popupBorderBoxShadow ?? "dark-lg"}
                  bgGradient={popup?.popupBackgroundGradient ?? undefined}
                >
                  <Flex direction={"column"} width={"full"}>
                    {pastChatGPTInput.length < 2 && (
                      <>
                        <Flex
                          w={"full"}
                          h={"full"}
                          direction="column"
                          bgGradient={
                            "linear-gradient(180deg, rgba(166,102,255,1) 32%, rgba(255,255,255,1) 66%)"
                          } // TODO: {popup?.popupBackgroundGradient ?? undefined}
                          border={popup?.popupBorderWidth ?? undefined}
                          borderColor={popup?.popupBorderColor ?? undefined}
                          borderRadius={popup?.popupBorderRadius ?? "0"}
                          px={4}
                          py={2}
                        >
                          {popup?.teaserImage && (
                            <ChakraBox
                              width="40px"
                              height="40px"
                              borderRadius="50%" // This creates a circular shape
                              overflow="hidden" // This ensures the image stays within the circular shape
                              borderColor="white" // Set background color to white
                              borderWidth={"thin"}
                            >
                              <Avatar
                                src={`${baseUrl}${popup?.teaserImage}`}
                                height="50px"
                                width="50px"
                                alignSelf="left"
                                style={{
                                  display: imageLoaded ? "block" : "none",
                                  width: "100%",
                                  height: "100%",
                                }}
                                onLoad={handleImageLoad}
                              />
                            </ChakraBox>
                          )}
                          <ChakraBox
                            h={
                              popup?.popupTitleAndContentPercentage ?? undefined
                            }
                            ml={popup?.popupTextMarginLeft ?? undefined}
                            mr={popup?.popupTextMarginRight ?? undefined}
                          >
                            {true && popup?.popupTitle && (
                              <ChakraBox
                                mt={popup?.popupImage ? 9 : undefined}
                                width={popup?.popupTitleWidth ?? undefined}
                                textColor={
                                  popup?.popupTitleTextColor ?? undefined
                                }
                              >
                                <Text
                                  fontSize={popup?.popupTitleFontSize ?? "24px"}
                                  fontWeight={
                                    popup?.popupTitleFontWeight ?? "bold"
                                  }
                                  textAlign="center"
                                >
                                  {popup?.popupTitle}
                                </Text>
                              </ChakraBox>
                            )}

                            {true && popup?.popupContent && (
                              <ChakraBox
                                width={popup?.popupContentWidth ?? undefined}
                                textColor={
                                  popup?.popupContentTextColor ?? undefined
                                }
                              >
                                <Text
                                  fontSize={
                                    popup?.popupContentFontSize ?? "16px"
                                  }
                                  fontWeight={
                                    popup?.popupContentFontWeight ?? "bold"
                                  }
                                >
                                  {popup?.popupContent}
                                </Text>
                              </ChakraBox>
                            )}

                            <Flex
                              mt={4}
                              border={popup?.popupBorderWidth ?? undefined}
                              borderColor={"purple.400" ?? undefined}
                              boxShadow={"md"}
                              bg={"white"}
                              borderRadius={
                                popup?.popupBorderRadius ? "12px" : undefined
                              }
                              w={"full"}
                              pb={2}
                              px={5}
                              justify={"space-around"}
                            >
                              <Flex direction={"column"}>
                                <Flex
                                  justify={"flex-end"}
                                  align={"flex-end"}
                                  mt={3}
                                >
                                  <TimeIcon />
                                  <Text fontSize={"2xs"} ml={1}>
                                    1 min.
                                  </Text>
                                </Flex>
                                <Text fontWeight={"bold"} align={"left"}>
                                  Product Recommender
                                </Text>
                                <Text align={"left"} fontSize={"sm"}>
                                  Let your shop assistant recommend the most
                                  suiting products according to your interests.
                                </Text>
                                <ChakraBox>
                                  <Flex
                                    w={"full"}
                                    mt={4}
                                    p={2}
                                    align={"center"}
                                    justifyContent={"space-around"}
                                    borderWidth={"1px" ?? undefined}
                                    borderColor={"purple.400" ?? undefined}
                                    bgGradient={
                                      "linear-gradient(91deg, #793DCC 0%, #A666FF 100%)"
                                    }
                                    textColor={"white"}
                                    borderRadius={
                                      popup?.popupBorderRadius
                                        ? "12px"
                                        : undefined
                                    }
                                  >
                                    <ChakraBox
                                      fontWeight={"extrabold"}
                                      ml={2}
                                      textAlign={"center"}
                                    >
                                      {question?.text}
                                    </ChakraBox>
                                  </Flex>
                                </ChakraBox>
                                <ChakraBox>
                                  {question?.answers.map((answer) => (
                                    <ChakraBox
                                      mt={1}
                                      className="MainComponent"
                                      key={answer.id}
                                      borderWidth={1}
                                      padding={0}
                                      borderRadius={
                                        !!answer.answerBorderRadius
                                          ? answer.answerBorderRadius
                                          : popup?.answerBorderRadius ??
                                            undefined
                                      }
                                      boxShadow={
                                        !!answer.answerBorderBoxShadow
                                          ? answer.answerBorderBoxShadow
                                          : popup?.answerBorderBoxShadow ??
                                            undefined
                                      }
                                      bgColor={
                                        !!answer.answerBackgroundColor
                                          ? answer.answerBackgroundColor
                                          : popup?.answerBackgroundColor ??
                                            undefined
                                      }
                                      textColor={
                                        !!answer.answerTextColor
                                          ? answer.answerTextColor
                                          : popup?.answerTextColor ?? undefined
                                      }
                                      overflow="hidden"
                                      borderColor={
                                        !selectedAnswers.some(
                                          (e) => e.answerId === answer.id
                                        )
                                          ? !!answer.answerBorderColor
                                            ? answer.answerBorderColor
                                            : popup?.answerBorderColor ?? "teal"
                                          : "gray"
                                      }
                                    >
                                      <ChakraButton
                                        key={answer.id}
                                        as="a"
                                        borderRadius={
                                          !!answer.answerBorderRadius
                                            ? answer.answerBorderRadius
                                            : popup?.answerBorderRadius ??
                                              undefined
                                        }
                                        boxShadow={
                                          !!answer.answerBorderBoxShadow
                                            ? answer.answerBorderBoxShadow
                                            : popup?.answerBorderBoxShadow ??
                                              undefined
                                        }
                                        borderColor={
                                          !!answer.answerBorderColor
                                            ? answer.answerBorderColor
                                            : popup?.answerBorderColor ??
                                              undefined
                                        }
                                        bgColor={
                                          !!answer.answerBackgroundColor
                                            ? answer.answerBackgroundColor
                                            : popup?.answerBackgroundColor ??
                                              undefined
                                        }
                                        textColor={
                                          !!answer.answerTextColor
                                            ? answer.answerTextColor
                                            : popup?.answerTextColor ??
                                              undefined
                                        }
                                        onClick={() =>
                                          clickAnswer(
                                            answer.id,
                                            answer.text_for_chatgpt
                                          )
                                        }
                                        href={
                                          answer.next_question
                                            ? undefined
                                            : answer.answerHasCallToAction
                                            ? answer.answerCallToActionURL
                                            : undefined
                                        }
                                        target="_blank" // Open the URL in a new tab
                                        rel="noopener noreferrer" // Recommended for security reasons
                                        width={"full"}
                                        p={2} // Remove padding to make image cover the whole button area
                                      >
                                        <Flex
                                          borderColor={
                                            !selectedAnswers.some(
                                              (e) => e.answerId === answer.id
                                            )
                                              ? !!answer.answerBorderColor
                                                ? answer.answerBorderColor
                                                : popup?.answerBorderColor ??
                                                  "white"
                                              : undefined
                                          }
                                          align={"center"}
                                          width="100%"
                                          px={2}
                                        >
                                          <CheckIcon />
                                          <Text textAlign={"left"} ml={2}>
                                            {answer.text}
                                          </Text>
                                        </Flex>
                                      </ChakraButton>
                                    </ChakraBox>
                                  ))}
                                </ChakraBox>
                              </Flex>
                            </Flex>

                            {true && (
                              <>
                                <ChakraBox position="relative" mt={7}>
                                  <ChakraBox
                                    position="absolute"
                                    top="-10px"
                                    left="50%"
                                    style={{ transform: "translate(-50%)" }}
                                  >
                                    <Text
                                      textTransform="uppercase"
                                      bg={"purple.100"}
                                      px={3}
                                      py={1}
                                      color={"gray.900"}
                                      fontSize="sm"
                                      fontWeight="600"
                                      rounded="xl"
                                    >
                                      Recommended
                                    </Text>
                                  </ChakraBox>
                                </ChakraBox>
                                <Flex
                                  mt={4}
                                  border={popup?.popupBorderWidth ?? undefined}
                                  borderColor={
                                   'purple.400' ?? undefined
                                  }
                                  boxShadow={"md"}
                                  bg={"white"}
                                  borderRadius={
                                    popup?.popupBorderRadius
                                      ? "12px"
                                      : undefined
                                  }
                                  w={"full"}
                                  h={"70px"}
                                  px={5}
                                  justify={"space-between"}
                                  align={"center"}
                                >
                                  <Flex direction={"row"} justify={'center'} align={'center'}>
                                    <Img
                                      src={
                                        recommendedProducts?.[0]?.productImage
                                          ? `${recommendedProducts?.[0]?.productImage}`
                                          : 'https://www.shutterstock.com/shutterstock/photos/2121480251/display_1500/stock-vector-mystery-box-icon-question-mark-inside-gift-box-for-rare-upcoming-product-online-shop-social-media-2121480251.jpg' //  `${baseUrl}${"/uploads/questionMark.png"}` //TODO
                                      }
                                      flexShrink={0} // Prevent the image from shrinking
                                      flexGrow={1} // Allow the image to grow
                                      height={"50px"}
                                      maxW={"50px"}
                                      borderRadius={
                                        popup?.popupBorderRadius
                                          ? "6px"
                                          : undefined
                                      }
                                    />
                                    <Text
                                      ml={4}
                                      color={"black"} //popup?.answerTextColor ?? undefined}
                                      textAlign="left" // Center align text
                                    >
                                      {recommendedProducts?.[0]?.productTitle ?? "Your personal product recommendation"}
                                    </Text>
                                  </Flex>
                                  <ChakraBox
                                    as="a"
                                    borderRadius={
                                      popup?.answerBorderRadius ?? undefined
                                    }
                                    boxShadow={
                                      popup?.answerBorderBoxShadow ?? undefined
                                    }
                                    borderColor={
                                      popup?.answerBorderColor ?? undefined
                                    }
                                    bgColor={
                                      popup?.answerBackgroundColor ?? undefined
                                    }
                                    textColor={
                                      popup?.answerTextColor ?? undefined
                                    }
                                    target="_blank" // Open the URL in a new tab
                                    rel="noopener noreferrer" // Recommended for security reasons
                                    href={
                                      recommendedProducts?.[0]?.productLink
                                        ? recommendedProducts?.[0]?.productLink
                                        : undefined
                                    }
                                    p={3}
                                  >
                                    <LinkIcon />
                                  </ChakraBox>
                                </Flex>
                              </>
                            )}
                          </ChakraBox>
                        </Flex>
                      </>
                    )}

                    {pastChatGPTInput.length > 1 && (
                      <>
                        <Flex
                          justify={"space-between"}
                          align={"center"}
                          px={2}
                          py={1}
                          bgGradient={
                            "linear-gradient(91deg, #793DCC 0%, #A666FF 100%)"
                          }
                          borderTop={popup?.popupBorderWidth ?? undefined}
                          borderColor={popup?.popupBorderColor ?? undefined}
                          borderTopRadius={popup?.popupBorderRadius ?? "0"}
                        >
                          <ChakraBox px={4}>
                            <Text fontWeight={"bold"} 
                            textColor={'white'} // TODO
                            >
                              Shop Recommender</Text>
                          </ChakraBox>
                          {!popup?.alwaysDisplay && (
                            <Flex
                              direction={"row"}
                              justify={"space-around"}
                              py={2}
                              px={1}
                            >
                              <ChakraButton
                                onClick={() =>
                                  setTheReducerState({
                                    type: "setPopupCreationState",
                                    payload: false,
                                  })
                                }
                                bg={
                                  popup?.popupCloseButtonBoxColor ?? undefined
                                }
                                color={
                                  popup?.popupCloseButtonTextColor ?? undefined
                                }
                                colorScheme={
                                  popup?.popupCloseButtonColorScheme ??
                                  undefined
                                }
                                variant={
                                  popup?.popupCloseButtonVariant ?? undefined
                                }
                                fontSize={"16px"}
                                p={1}
                                
                              >
                                {popup?.popupCloseButtonText}
                              </ChakraButton>
                            </Flex>
                          )}
                        </Flex>
                        <Divider />
                        <QuestionaireInChat
                          {...{
                            recommendedProducts,
                            isLoadingThreeWave,
                            flatConversationHistory,
                            allQuestions,
                            popupEngagement,
                            popup,
                            question,
                            selectedAnswers,
                            pastChatGPTInput,
                            chatGPTs,
                            pastChatGPTOutput,
                            popupAdditionals,
                            inputChatGPT,
                            handleChatGPTSubmit,
                            handleButtonSubmit,
                            handleInputChange,
                            control,
                            clickAnswer,
                            toggleAnswer,
                            submitAnswer,
                          }}
                        />
                      </>
                    )}
                  </Flex>
                </Flex>
              )}

              {popup?.popupOrChat === "Popup" && (
                <Flex
                  width={"820px"}
                  minH={"270px"}
                  align={"center"}
                  justify={"center"}
                  bg={popup?.popupBackgroundColor ?? "white"}
                  px={4}
                  border={popup?.popupBorderWidth ?? undefined}
                  borderColor={popup?.popupBorderColor ?? undefined}
                  borderRadius={popup?.popupBorderRadius ?? "0"}
                  boxShadow={popup?.popupBorderBoxShadow ?? "dark-lg"}
                  bgGradient={popup?.popupBackgroundGradient ?? undefined}
                >
                  <Questionnaire
                    {...{
                      allQuestions,
                      popupEngagement,
                      popup,
                      question,
                      selectedAnswers,
                      pastChatGPTInput,
                      chatGPTs,
                      pastChatGPTOutput,
                      popupAdditionals,
                      inputChatGPT,
                      handleChatGPTSubmit,
                      handleButtonSubmit,
                      handleInputChange,
                      control,
                      clickAnswer,
                      toggleAnswer,
                      submitAnswer,
                    }}
                  />
                </Flex>
              )}
            </ChakraBox>
          </>
        )}
    </>
  );
}

export default ConvertPopup;
