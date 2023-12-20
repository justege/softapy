import React, { useState,useEffect, useRef, useMemo } from 'react';
import { Box as ChakraBox, Button as ChakraButton,  Flex, Input,Image, Text, HStack, Wrap, WrapItem, Img, Divider, Avatar, Radio} from "@chakra-ui/react";
import { ChatGPT, PopupEngagement, PopupAdditional, Popup, Question, selectedAnswersType, RecommendedProduct} from './Types'
import { motion, useAnimation } from 'framer-motion';
import { Controller } from 'react-hook-form';
import { baseUrl} from './shared'
import DOMPurify from 'dompurify';
import ThreeDotsWave from './ThreeDotsWave'
import { CheckIcon, LinkIcon } from '@chakra-ui/icons'


const MotionButton = motion(ChakraButton);
const MotionBox = motion(ChakraBox)
const MotionImage = motion(Image);



type QuestionaireInChatProps = {
    allQuestions: Question[];
    popupEngagement: PopupEngagement;
    recommendedProducts: RecommendedProduct[];
    popup?: Popup;
    isLoadingThreeWave: boolean;
    question: Question | null;
    selectedAnswers: selectedAnswersType;
    pastChatGPTInput: string[];
    chatGPTs: ChatGPT[];
    pastChatGPTOutput: string[];
    popupAdditionals: PopupAdditional[];
    inputChatGPT: string; 
    control: any;
    clickAnswer: (answerId: number, answerChatGPT: string) => void;
    toggleAnswer: (answerId: number, answerChatGPT: string) => void; 
    submitAnswer: () => void;
    handleChatGPTSubmit: (questionId: number) => void;
    handleButtonSubmit: (ButtonInput: string) => void; 
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const QuestionaireInChat = (props: QuestionaireInChatProps) => {
 
    const {  allQuestions, recommendedProducts, isLoadingThreeWave, popupEngagement, popup, pastChatGPTInput, chatGPTs, pastChatGPTOutput, popupAdditionals, inputChatGPT, handleChatGPTSubmit, handleButtonSubmit, handleInputChange, question, selectedAnswers, control, clickAnswer, toggleAnswer, submitAnswer} = props

  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  useEffect(() => {
    async function preloadImages() {
      const imagePreloadPromises: { [id: string]: Promise<void> } = {};
      const preloadedImagesObject: { [id: string]: HTMLImageElement } = {};

      for (const question of allQuestions) {
        for (const answer of question.answers) {
          const image = new window.Image();
          const promise = new Promise<void>((resolve, reject) => {
            image.onload = () => {
              preloadedImagesObject[answer.id] = image;
              resolve();
            };
            image.onerror = reject;
          });

          image.src = `${baseUrl}${answer.image}`
          imagePreloadPromises[answer.id] = promise;
        }
      }

      try {
        await Promise.all(Object.values(imagePreloadPromises));
        setImagesPreloaded(true);
      } catch (error) {
        console.error('Image preload error:', error);
      }
    }

    preloadImages();
  }, [allQuestions]);


    const flexContainerRef = useRef<HTMLDivElement>(null);

    function formatTextWithLinks(text: string) {
      const urlRegex = /(?:https?:\/\/[^\s]+(?:\.[^\s]+)*(?:\/[^\s]*)?)(?<![.,?!])/g;
      return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank">${url}</a>`);
      }

    useEffect(() => {
        handleScrollToBottom(); 
      }, [pastChatGPTOutput, recommendedProducts]);

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

      const loadingAnimation = useAnimation();

    
      useEffect(() => {
        if(chatGPTs.some((e)=> e.outputChatGPT = '') && question?.text) {
          const startLoadingAnimation = async () => {
            await loadingAnimation.start({
              opacity: [1, 0.6, 0.2, 1], // Opacity values for the loading animation
              transition: { duration: 1, repeat: 5 }, // Duration and repeat options
            });
          };
          startLoadingAnimation();
        } else {
          loadingAnimation.stop()
        }

      if(!question?.text){
          loadingAnimation.stop()
        }
      }, [chatGPTs, loadingAnimation, question?.text]);

    
      const InputComponent = () => {
        return (<MotionBox padding={3}>
        {question?.answers.map(answer => (
           <React.Fragment key={answer.id}>
            {answer.answerHasInputField &&
            <>
            <Text maxH={'40%'} textAlign={'left'}>{answer.text}</Text>
            <MotionBox 
              mt={1}
              borderWidth={2} 
              padding={!!answer.answerPadding ? answer.answerPadding : (popup?.answerPadding ?? undefined)} 
              borderRadius={!!answer.answerBorderRadius ? answer.answerBorderRadius : (popup?.answerBorderRadius ?? undefined)}
              boxShadow={!!answer.answerBorderBoxShadow ? answer.answerBorderBoxShadow : (popup?.answerBorderBoxShadow ?? undefined)}
              borderColor={!!answer.answerBorderColor ? answer.answerBorderColor : (popup?.answerBorderColor ?? undefined)} 
              bgColor={!!answer.answerBackgroundColor ? answer.answerBackgroundColor : (popup?.answerBackgroundColor ?? undefined)} 
              textColor={!!answer.answerTextColor ? answer.answerTextColor : (popup?.answerTextColor ?? undefined)}
              margin = {!!answer.answerMargin ? answer.answerMargin : (popup?.answerMargin ?? undefined)}
              whileFocus={{ boxShadow: "0 0 0 2px #black" }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              >
              <Controller
              key={answer.id}
              control={control}
              name={`questionId.${answer.id}`}
              render={({ field }) => (
                <Input
                  px={3}
                  variant='flushed' 
                  value={field.value}
                  onChange={field.onChange}
                  placeholder= {answer.answerInputTextField}
                  size='md'
                />
              )}
            />
             </MotionBox>
           </>
          }
      </React.Fragment>
      ))}
    {question?.answers.some((e)=> e.answerHasInputField) && 
      <ChakraButton 
      w={'full'} 
      mt={5}
      onClick={submitAnswer}
      textColor={popup?.popupQuestionarySubmitButtonTextColor ?? undefined}
      backgroundColor={popup?.popupQuestionarySubmitButtonColor ?? undefined}
      borderColor={popup?.popupQuestionarySubmitBorderColor ?? undefined} 
      borderWidth={popup?.popupQuestionarySubmitHasBorder ? 'thin' : undefined}
      >
      {popup?.popupQuestionarySubmitButtonText ?? 'Submit'}
      </ChakraButton>
    }
      </MotionBox>)
    }


 return (
    <ChakraBox h={'570px'} >   
      {popup?.popupImage && 
      <Img src={`${baseUrl}${popup?.popupImage}`} width={'200px'} zIndex={4} top={'-115px'} left={'140px'} position={'absolute'}/> 
      }

      {popupEngagement?.popupEngagementUniqueIdentifier && false && (
        <Flex
          direction="column"
          h={popup?.popupTitleAndContentPercentage ?? undefined }
          ml={popup?.popupTextMarginLeft ?? undefined}
          mr={popup?.popupTextMarginRight ?? undefined}
          >
          
          <ChakraBox>
            {true && popup?.popupTitle && (
              <ChakraBox
                p={2}
                mt={popup?.popupImage ? 9 : undefined}
                minHeight={popup?.popupTitleHeight ?? undefined}
                width={popup?.popupTitleWidth ?? undefined}
                textColor={popup?.popupTitleTextColor ?? undefined}
              >
                <Text 
                fontSize= {popup?.popupTitleFontSize ?? "24px"} 
                fontWeight= {popup?.popupTitleFontWeight ?? "bold"} 
                textAlign="center"   
                bgGradient={popup?.popupTitleBgGradient ?? 'linear(to-l, #7928CA, #FF0080)'}
                bgClip='text'
                >
                  {popup?.popupTitle}
                </Text>
              </ChakraBox>
            )}

            {true && popup?.popupContent && (
              <ChakraBox
                p={2}
                mt={2}
                minHeight={popup?.popupContentHeight ?? undefined}
                width={popup?.popupContentWidth ?? undefined}
                textColor={popup?.popupContentTextColor ?? undefined}
              >
                <Text fontSize= {popup?.popupContentFontSize ?? "16px"} fontWeight= {popup?.popupContentFontWeight ?? "bold"} >
                  {popup?.popupContent}
                  </Text>
              </ChakraBox>
            )}
          </ChakraBox>
        </Flex>
      )}
      
    <ChakraBox ref={flexContainerRef} overflowY="auto" h={'470px'}>
        <ChakraBox p={2} m={1}>
          <Flex direction="column" >
            {(pastChatGPTInput.length>0 ? pastChatGPTInput : ['...']).map((input, index) => (
              <ChakraBox key={index}>
                <Flex justifyContent="flex-end">
                  <MotionBox
                    mt={1}
                    px={2}
                    py={2}
                    fontSize={popup?.popupChatHistoryFontSize ?? "14px"}
                    borderRadius="8px 8px 0 8px"
                    borderWidth="1px"
                    borderColor={popup?.popupChatHistoryInputFocusBorderColor ?? undefined}
                    boxShadow="md"
                    textColor={popup?.popupChatHistoryInputTextColor ?? undefined}
                    backgroundColor={popup?.popupChatHistoryInputBoxColor ?? undefined}
                    position="relative"
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
                {pastChatGPTOutput[index] &&
                  <Flex justifyContent="flex-start">
                     <Avatar
                        src={`${baseUrl}${popup?.teaserImage}`}
                        height={'25px'}
                        width={'25px'}
                        alignSelf={'center'}
                      />
                    <MotionBox
                      ml={2}
                      mt={1}
                      px={2}
                      py={2}
                      fontSize={popup?.popupChatHistoryFontSize ?? "14px"}
                      borderRadius="8px 8px 8px 0"
                      borderWidth="1px"
                      borderColor={popup?.popupChatHistoryOutputFocusBorderColor ?? undefined}
                      boxShadow="md"
                      textColor={popup?.popupChatHistoryOutputTextColor ?? undefined}
                      backgroundColor={popup?.popupChatHistoryOutputBoxColor ?? undefined}
                      position="relative"
                      overflow="hidden"
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
                      <Text>
                      {pastChatGPTOutput[index]}
                        </Text>
                  </MotionBox>
              </Flex>
              }

            </ChakraBox>
            ))}
            
            {isLoadingThreeWave &&
            <ChakraBox>
                  <Flex justifyContent="flex-start">
                  <Avatar
                        src={`${baseUrl}${popup?.teaserImage}`}
                        height={'25px'}
                        width={'25px'}
                        alignSelf={'center'}
                      />
                    <MotionBox
                      ml={2}
                      px={2}
                      py={2}
                      fontSize={popup?.popupChatHistoryFontSize ?? "14px"}
                      borderRadius="8px 8px 8px 0"
                      borderWidth="1px"
                      borderColor={popup?.popupChatHistoryOutputFocusBorderColor ?? undefined}
                      boxShadow="md"
                      textColor={popup?.popupChatHistoryOutputTextColor ?? undefined}
                      backgroundColor={popup?.popupChatHistoryOutputBoxColor ?? undefined}
                      position="relative"
                      overflow="audo"
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
                      <ThreeDotsWave />
                  </MotionBox>
              </Flex>
              </ChakraBox >
              }



    <HStack mt={2}  >
    <Wrap>
    {question?.answers.map((answer) => (
    <React.Fragment key={answer.id}>
      {!answer.answerHasInputField &&
     (
      <WrapItem 
      w={'full'}
      >
     <Flex align={'center'} justify={'center'} h={'40px'} >
      <Radio isChecked={false} ml={1}/>
      </Flex>
      <MotionBox 
      ml={'12px'}
      className='MainComponent'
      key = {answer.id}
      borderWidth={2} 
      padding={0} 
      borderRadius={!!answer.answerBorderRadius ? answer.answerBorderRadius : (popup?.answerBorderRadius ?? undefined)}
      boxShadow={!!answer.answerBorderBoxShadow ? answer.answerBorderBoxShadow : (popup?.answerBorderBoxShadow ?? undefined)}
      bgColor={!!answer.answerBackgroundColor ? answer.answerBackgroundColor : (popup?.answerBackgroundColor ?? undefined)} 
      textColor={!!answer.answerTextColor ? answer.answerTextColor : (popup?.answerTextColor ?? undefined)}
      overflow="hidden"
      borderColor={!selectedAnswers.some((e) => e.answerId === answer.id) ? !!answer.answerBorderColor ? answer.answerBorderColor : (popup?.answerBorderColor ?? 'teal') : "gray"}
      w={'97%'}
      >
      <ChakraButton
      key={answer.id}
      as="a"
      borderRadius={!!answer.answerBorderRadius ? answer.answerBorderRadius : (popup?.answerBorderRadius ?? undefined)}
      boxShadow={!!answer.answerBorderBoxShadow ? answer.answerBorderBoxShadow : (popup?.answerBorderBoxShadow ?? undefined)}
      borderColor={!!answer.answerBorderColor ? answer.answerBorderColor : (popup?.answerBorderColor ?? undefined)} 
      bgColor={!!answer.answerBackgroundColor ? answer.answerBackgroundColor : (popup?.answerBackgroundColor ?? undefined)} 
      textColor={!!answer.answerTextColor ? answer.answerTextColor : (popup?.answerTextColor ?? undefined)}
      onClick={() => clickAnswer(answer.id, answer.text_for_chatgpt)}
      href={answer.next_question ? undefined : (answer.answerHasCallToAction ? answer.answerCallToActionURL : undefined)} 
      target="_blank" // Open the URL in a new tab
      rel="noopener noreferrer" // Recommended for security reasons
      width={'full'}
      p={2} // Remove padding to make image cover the whole button area
      >
      <Flex
        borderColor={!selectedAnswers.some((e) => e.answerId === answer.id) ? !!answer.answerBorderColor ? answer.answerBorderColor : (popup?.answerBorderColor ?? 'white') : undefined}
        align={'center'}
        width='100%'
        px={2}
      >
      <CheckIcon />
      <Text textAlign={'left'} ml={2}>{answer.text}</Text>
      </Flex>
      </ChakraButton>
      </MotionBox>
      </WrapItem>
      )} </React.Fragment> ))}
      
      {(recommendedProducts.length > 0) && 
      <>
      {recommendedProducts.map((product) => (
      <>
      <WrapItem
      w={'full'}
      >
      <Flex align={'center'} justify={'center'} h={'65px'}>
      <Radio isChecked={false} ml={1}/>
      </Flex>
      <MotionBox 
      href={product.productLink  ? product.productLink : undefined} 
      as={'a'}
      target="_blank" // Open the URL in a new tab
      rel="noopener noreferrer" // Recommended for security reasons
      ml={'12px'}
      className='MainComponent'
      borderWidth={2} 
      padding={0} 
      borderRadius={ (popup?.answerBorderRadius ?? undefined)}
      boxShadow={(popup?.answerBorderBoxShadow ?? undefined)}
      bgColor={(popup?.answerBackgroundColor ?? undefined)} 
      textColor={(popup?.answerTextColor ?? undefined)}
      overflow="hidden"
      borderColor={(popup?.answerBorderColor ?? 'teal')}
      >
      <Flex
        p={2}
        borderColor={(popup?.answerBorderColor ?? 'white')}
        direction="row" // stack child components vertically    
        justify={'space-between'}   
        align={'center'}
        >
        <Flex direction={'row'}>
        <MotionImage 
          src={product.productImage ? `${product.productImage}` : `${baseUrl}${'/uploads/questionMark.png'}`} 
          flexShrink={0} // Prevent the image from shrinking
          flexGrow={1} // Allow the image to grow
          height={'50px'}
          maxW={'50px'}
        /> 
        <Text 
          ml={4}
          fontSize='16px' 
          color={'black'}//popup?.answerTextColor ?? undefined}
          textAlign="left" // Center align text
          >
          {product.productTitle}
        </Text>
        </Flex>
          <MotionBox
          as="a"
          borderRadius={(popup?.answerBorderRadius ?? undefined)}
          boxShadow={ (popup?.answerBorderBoxShadow ?? undefined)}
          borderColor={ (popup?.answerBorderColor ?? undefined)} 
          bgColor={(popup?.answerBackgroundColor ?? undefined)} 
          textColor={(popup?.answerTextColor ?? undefined)}
          target="_blank" // Open the URL in a new tab
          rel="noopener noreferrer" // Recommended for security reasons
          href={product.productLink  ? product.productLink : undefined} 
          p={3} 
          >
          <LinkIcon />
          </MotionBox>
      </Flex>
      </MotionBox>
      </WrapItem>
    </>
    ))}
    </>}
  </Wrap>
   </HStack>  
</Flex>
   
    </ChakraBox>
    <InputComponent />
    </ChakraBox>


      <Divider />

      {true && chatGPTs.length === 0 && (
      <ChakraBox  mx={1} display="flex" overflowX="auto"  overflowY={'auto'} maxWidth={'450px'}>
        {popupAdditionals?.map((suggestion, idx) => (
          <MotionButton
          key={`${suggestion.popupAdditionalId }--${idx}`} 
          size={"xs"}
          my={2}
          ml={1}
          minW="auto" 
          px={2}
          onClick={() => handleButtonSubmit(suggestion.popupAdditionalChatText)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          color={popup?.popupSuggestionButtonTextColor ?? 'teal'}
          backgroundColor={popup?.popupSuggestionButtonBoxColor ?? 'teal'}
          borderColor={popup?.popupSuggestionButtonFocusBorderColor ?? undefined}
          _hover={{bgColor: undefined}}
          >
            <Text>
          {suggestion.popupAdditionalText}
          </Text>
          </MotionButton>
        ))}
      </ChakraBox>
      )}
      { true && (
        <>
        <ChakraBox p={1}>
        <Flex ml={'15px'}>
          <ChakraBox width="100%">
            <Input
              type="text"
              h={'40px'}
              value={inputChatGPT}
              onChange={handleInputChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleChatGPTSubmit(question?.id ?? 1);
                }
              }}
              placeholder={popup?.popupChatButtonText ?? "Enter text here"}
              borderRadius="md"
              bgColor={popup?.popupChatButtonBoxColor ?? undefined}
              textColor={popup?.popupChatButtonTextColor ?? undefined}
              _placeholder={{ color: popup?.popupChatButtonTextColor ?? undefined }}
              p={2}
              mt={2}
            />
          </ChakraBox>
          <ChakraBox>
            <MotionButton 
            onClick={()=>handleChatGPTSubmit(question?.id ?? 1)} 
            colorScheme={popup?.popupSendButtonScheme ?? undefined} 
            bgColor={popup?.popupSendButtonColor ?? undefined} 
            borderColor={popup?.popupSendButtonBorderColor ?? undefined}
            borderWidth={'thin'}
            m={2} 
            ml={3} 
            size={'md'}
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
        </>)}
        <Flex justify={"center"}>
        <Text fontSize={"10px"} mt={0.5}>
          powered by        
        </Text>
        <ChakraBox fontSize={"10px"} mt={0.5} ml={1} fontWeight={"extrabold"} as={"a"} href='https://erecommender.com/'>
          eRecommender.com
        </ChakraBox>
        </Flex>

    </ChakraBox>
    )
}