import { useEffect, useState, useRef, useMemo } from 'react';
import { Box as ChakraBox, Button as ChakraButton,  Flex, Input, Text} from "@chakra-ui/react";
import { ChatGPT, PopupEngagement, PopupAdditional, Popup, Question, selectedAnswersType} from './Types'
import { motion, useAnimation } from 'framer-motion';

const MotionButton = motion(ChakraButton);
const MotionBox = motion(ChakraBox)

type ChatComponentProps = {
    popupEngagement: PopupEngagement;
    popup?: Popup;
    question: Question | null;
    selectedAnswers: selectedAnswersType;
    pastChatGPTInput: string[];
    chatGPTs: ChatGPT[];
    pastChatGPTOutput: string[];
    popupAdditionals: PopupAdditional[];
    inputChatGPT: string; 
    handleChatGPTSubmit: (questionId: number) => void;
    handleButtonSubmit: (ButtonInput: string) => void; 
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}


export const ChatComponent = (props: ChatComponentProps) => {

    const { popupEngagement, popup, pastChatGPTInput, chatGPTs, pastChatGPTOutput, popupAdditionals, inputChatGPT, handleChatGPTSubmit, handleButtonSubmit, handleInputChange} = props

    const flexContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        handleScrollToBottom(); // Scroll to the bottom after chatGPTs update
      }, [pastChatGPTOutput]);

    const handleScrollToBottom = () => {
      if (flexContainerRef.current) {
        const { scrollHeight, offsetHeight } = flexContainerRef.current;
        flexContainerRef.current.scrollTop = scrollHeight - offsetHeight;
      }
    };

    const calculateHeight = useMemo(() => {
        if (popup?.popupChatHistoryPercentage && popup?.popupCTAPercentage && chatGPTs.length > 0) {
          return `${(parseInt(popup?.popupChatHistoryPercentage) + parseInt(popup?.popupCTAPercentage))}%`;
        }
        if (popup?.popupChatHistoryPercentage){
          return popup?.popupChatHistoryPercentage
        }
      }, [popup, chatGPTs]);

      const [loading, setLoading] = useState(false);
      const loadingAnimation = useAnimation();
    
      useEffect(() => {
        if (chatGPTs.length === 0) {
          setLoading(true); // Set loading to true when there is no chat output
          const startLoadingAnimation = async () => {
            await loadingAnimation.start({
              opacity: [1, 0.6, 0.2, 1], // Opacity values for the loading animation
              transition: { duration: 1, repeat: Infinity }, // Duration and repeat options
            });
          };
    
          startLoadingAnimation();
        } else {
          setLoading(false); // Set loading to false when chatGPTs have some output
        }
      }, [chatGPTs, loadingAnimation]);


    return (
     <>    
      {popupEngagement?.popupEngagementUniqueIdentifier && (
        <Flex
          direction="column"
          h={popup?.popupTitleAndContentPercentage ?? undefined }
          ml={popup?.popupTextMarginLeft ?? undefined}
          mr={popup?.popupTextMarginRight ?? undefined}
        >
          <ChakraBox>
            {popup?.popupTitle && (
              <ChakraBox
                p={2}
                mt={2}
                minHeight={popup?.popupTitleHeight ?? undefined}
                width={popup?.popupTitleWidth ?? undefined}
                textColor={popup?.popupTitleTextColor ?? undefined}
              >
                <Text fontSize= {popup?.popupTitleFontSize ?? "3xl"} fontWeight= {popup?.popupTitleFontWeight ?? "bold"} textAlign="center">
                  {popup?.popupTitle}
                </Text>
              </ChakraBox>
            )}

            {popup?.popupContent && (
              <ChakraBox
                p={4}
                minHeight={popup?.popupContentHeight ?? undefined}
                width={popup?.popupContentWidth ?? undefined}
                textColor={popup?.popupContentTextColor ?? undefined}
              >
                <Text fontSize= {popup?.popupContentFontSize ?? "sm"} fontWeight= {popup?.popupContentFontWeight ?? "bold"} >
                  {popup?.popupContent}
                  </Text>
              </ChakraBox>
            )}
          </ChakraBox>
        </Flex>
      )}
        <ChakraBox ref={flexContainerRef} overflowY="scroll" h={calculateHeight}>
        <ChakraBox p={2} m={1}>
          <Flex direction="column">
            {(pastChatGPTInput.length>0 ? pastChatGPTInput : ['...']).map((input, index) => (
              <ChakraBox key={index}>
                <Flex justifyContent="flex-end">
                  <MotionBox
                    mt={1}
                    px={2}
                    py={1}
                    fontSize={popup?.popupChatHistoryFontSize ?? "sm"}
                    borderRadius="8px 8px 0 8px"
                    borderWidth="1px"
                    borderColor={popup?.popupChatHistoryInputFocusBorderColor ?? undefined}
                    boxShadow="md"
                    textColor={popup?.popupChatHistoryInputTextColor ?? undefined}
                    backgroundColor={popup?.popupChatHistoryInputBoxColor ?? undefined}
                    position="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    _after={{
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: "8px",
                      height: "8px",
                      borderTopRightRadius: 0,
                      backgroundColor: popup?.popupChatHistoryInputBoxColor ?? undefined,
                    }}
                    textAlign={"left"}
                  >
                    { pastChatGPTInput.length > 0 ? input : popup?.popupExampleInputChatGPT}
                  </MotionBox>
                </Flex>
                  <Flex justifyContent="flex-start">
                    <MotionBox
                      mt={1}
                      px={2}
                      py={1}
                      fontSize={popup?.popupChatHistoryFontSize ?? "sm"}
                      borderRadius="8px 8px 8px 0"
                      borderWidth="1px"
                      borderColor={popup?.popupChatHistoryOutputFocusBorderColor ?? undefined}
                      boxShadow="md"
                      textColor={popup?.popupChatHistoryOutputTextColor ?? undefined}
                      backgroundColor={popup?.popupChatHistoryOutputBoxColor ?? undefined}
                      position="relative"
                      overflow="hidden"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      _after={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "8px",
                        height: "8px",
                        borderTopLeftRadius: 0,
                        backgroundColor: popup?.popupChatHistoryOutputBoxColor ?? undefined,
                      }}
                      textAlign={"left"}
                    >
                    {pastChatGPTInput.length > 0 ?  
                      (!pastChatGPTOutput[index] ?       
                    <MotionBox 
                    animate={{                                
                        opacity: [1, 0.6, 0.4, 0.3, 0.6, 1, 0.6, 0.3, 0.6, 1, 1.4],
                        repeat: Infinity,
                        duration: 10
                    }}
                    >
                      <Text>
                        ...
                      </Text>
                      </MotionBox> 
                      : pastChatGPTOutput[index]) 
                      : popup?.popupExampleOutputChatGPT
                      }
                    </MotionBox>
                  </Flex>
              </ChakraBox>
            ))}
          </Flex>
        </ChakraBox>
      </ChakraBox>


      {chatGPTs.length === 0 && (
      <ChakraBox h={popup?.popupCTAPercentage  ?? undefined} >
            <ChakraBox mx={2}>
              {popupAdditionals?.map((suggestion, idx) => (
                <MotionButton
                  key={`${suggestion.popupAdditionalId }--${idx}`} 
                  size="xs"
                  mt={1}
                  ml={1}
                  onClick={() => handleButtonSubmit(suggestion.popupAdditionalText)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                >
                  {suggestion.popupAdditionalText}
                </MotionButton>
              ))}
            </ChakraBox>
      </ChakraBox>
      )}


        <ChakraBox h={popup?.popupChatSendPercentage ?? undefined}>
        <Flex>
          <ChakraBox width="80%">
            <Input
              type="text"
              value={inputChatGPT}
              onChange={handleInputChange}
              placeholder={popup?.popupChatButtonText ?? "Enter text here"}
              borderRadius="md"
              bgColor={popup?.popupChatButtonBoxColor ?? undefined}
              textColor={popup?.popupChatButtonTextColor ?? undefined}
              _placeholder={{ color: popup?.popupChatButtonTextColor ?? undefined }}
              p={2}
              m={2}
            />
          </ChakraBox>
          <ChakraBox>
            <MotionButton 
            onClick={()=>handleChatGPTSubmit(1)} 
            colorScheme={popup?.popupSendButtonScheme ?? undefined} 
            bgColor={popup?.popupSendButtonColor ?? undefined} 
            borderColor={popup?.popupSendButtonBorderColor ?? undefined}
            borderWidth={'thin'}
            m={2} 
            ml={3} 
            textColor={popup?.popupSendButtonTextColor ?? undefined} 
            variant = {popup?.popupSendButtonVariant ?? undefined} 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.94 }}
            >
            {popup?.popupSendButtonText ?? 'Send'}
            </MotionButton>
          </ChakraBox>
        </Flex>
        </ChakraBox>
    </>
    )
}