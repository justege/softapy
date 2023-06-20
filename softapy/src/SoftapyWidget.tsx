import { useEffect, useState, useRef } from 'react';
import { Box, Button, Flex, Input, Text, Spacer, Img } from "@chakra-ui/react";
import { baseUrl} from './shared'

interface Props {
  widget: HTMLElement;
}

type ChatGPT = {
  id: number;
  chatWebsiteURL: string;
  requestId: number;
  inputChatGPT: string;
  outputChatGPT: string;
}

type PopupEngagement = {
  id: number;
  popupEngagementId: number;
  popupEngagementTitle: string;
  popupEngagementEnd: string;
  popupEngagementStart: string;
  popupEngagementUniqueIdentifier: string;
}

interface PopupAdditional {
	popupAdditionalId : number;
	popupAdditionalText : string;
	popupAdditionalLink : string;
}

interface Popup {
  popupId: number;
  popupGoal: number | null;
  popupHeight: number | null;
  popupWidth: number | null;
  popupEmailSubscription: boolean | null;
  popupPromo: boolean | null;
  popupImage: string | null;
  popupImageBorderColor: string | null;
  popupImageBorderWidth: string | null;
  popupImageWidth: number | null;
  popupImageHeight: number | null;
  popupBackgroundColor: string | null;
  popupBorderColor: string | null;
  popupBorderWidth: string | null;
  popupTitle: string | null;
  popupTitleHeight: number | null;
  popupTitleWidth: number | null;
  popupTitlePositioning: number | null;
  popupTitleTextColor: string | null;
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
}


function SoftapyWidget({ widget }: Props) {
  const [popupEngagement, setPopupEngagement] = useState<PopupEngagement>()
  const [popupAdditionals, setPopupAdditionals] = useState<PopupAdditional[]>([])
  const [popup, setPopup] = useState<Popup>()
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);
  const [notFound, setNotFound] = useState<boolean>();
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState<unknown>();
  const id = parseInt(widget.getAttribute('userId') ?? '0');
  const popupId = parseInt(widget.getAttribute('popupId') ?? '0');
  const [chatGPTs, setChatGPTs] = useState<ChatGPT[]>([]);
  const [inputChatGPT, setInputChatGPT] = useState('');
  const [pastChatGPTInput, setPastChatGPTInput] = useState<string[]>([]);

  const createNewPopupEngagement = async () => {
    try {
      const response = await fetch(`${baseUrl}popup/createNewPopupEngagement/${popupId}/${id}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Something went wrong, try again later');
      }
      const data = await response.json();
      setPopupEngagement(data.customer)
      setError(undefined);
    } catch (error) {
      setError(error);
    }
  };

  const chatGPTInput = async (inputChatGPT: string) => {
    try {
      const response = await fetch(`${baseUrl}popup/chatgpt/${id}/${popupId}/${popupEngagement?.popupEngagementUniqueIdentifier}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputChatGPT: inputChatGPT, chatWebsiteURL: window.location.href }),
      });
      if (!response.ok) {
        throw new Error('Something went wrong, try again later');
      }
      const data = await response.json();
      setError(undefined);
    } catch (error) {
      setError(error);
    }
  };

  const [popupImage, setPopupImage] = useState<string | null>(null);

  const fetchImage = async (imageUrl: string | null) => {
    if (imageUrl) {
      try {
        const response = await fetch(`${baseUrl}${imageUrl}`);
        if (!response.ok) {
          throw new Error('Failed to fetch popup image');
        }
        const blob = await response.blob();
        const imageSrc = URL.createObjectURL(blob);
        setPopupImage(imageSrc);
        setError(undefined);
      } catch (error) {
        setError(error);
      }
    }
  };

  const fetchPopup = async () => {
    try {
      const response = await fetch(`${baseUrl}popup/${popupId}/${id}`);
      if (!response.ok) {
        throw new Error('Something went wrong, try again later');
      }
      const data = await response.json();
      setPopup(data.popup);

      setError(undefined);
      await fetchImage(data.popup.popupImage); // Fetch the popup image
    } catch (error) {
      setError(error);
    }
  };

  const fetchChatGPTs = async () => {
    try {
      const response = await fetch(`${baseUrl}popup/chatgpt/${id}/${popupId}/${popupEngagement?.popupEngagementUniqueIdentifier}`);
      if (!response.ok) {
        throw new Error('Something went wrong, try again later');
      }
      const data = await response.json();
      setPopupAdditionals(data.popupAdditional)

      if (data.chatgpt.length) {
        setChatGPTs(data.chatgpt);
      } 
      
      setError(undefined);
    } catch (error) {
      setError(error);
    }
  };
  
  useEffect(() => {
    fetchPopup();
    fetchChatGPTs();

  }, [id,popupEngagement?.popupEngagementUniqueIdentifier,pastChatGPTInput]);

 

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const message = event.target.value
    setInputChatGPT(message);

  };

  const handleSubmit = () => {
    chatGPTInput(inputChatGPT);
    fetchChatGPTs();
    setPastChatGPTInput((state) => [...state, inputChatGPT])
    setInputChatGPT('')
  };

  const handleButtonSubmit = (ButtonInput: string) => {
    chatGPTInput(ButtonInput);
    fetchChatGPTs();
    setPastChatGPTInput((state) => [...state, ButtonInput])
    setInputChatGPT('')
  }

  const [popupCreationState, setPopupCreationState] = useState(false);

  useEffect(() => {
    const handleMouseOut = (event: MouseEvent) => {
      if (event.clientY <= 0) {
        setPopupCreationState(true);
      }
    };
    window.addEventListener('mouseout', handleMouseOut);
    return () => {
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  useEffect(()=>{
    if (popupCreationState){
      createNewPopupEngagement()
    }
  },[popupCreationState])

  const flexContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (flexContainerRef.current) {
      flexContainerRef.current.scrollTop = flexContainerRef.current.scrollHeight;
    }
  }, [popupEngagement, chatGPTs]);
  



  return (
<>
{popupEngagement && (
  <Flex
    direction="row"
    w={popup?.popupWidth ?? [800, 550]}
    h={popup?.popupHeight ?? [500, 350]}
    bg={popup?.popupBackgroundColor ?? "white"}
    p={4}
    position="fixed"
    top="50%"
    left="50%"
    transform="translate(-50%, -50%)"
    border={popup?.popupBorderWidth ?? undefined}
    borderColor={popup?.popupBorderColor ?? undefined}
    borderRadius="md"
    boxShadow="lg"
  >
    {popupImage && (
      <Box w="50%">
        <Img
          border={popup?.popupImageBorderWidth ?? undefined}
          borderColor={popup?.popupImageBorderColor ?? undefined}
          width={popup?.popupImageWidth ?? undefined}
          height={popup?.popupImageHeight ?? undefined}
          src={popupImage}
          alt="Popup Image"
        />
      </Box>
    )}

    <Spacer />

    <Box w="50%">
      <Button
        onClick={() => setPopupEngagement(undefined)}
        bg={popup?.popupCloseButtonBoxColor ?? undefined}
        color={popup?.popupCloseButtonTextColor ?? undefined}
        colorScheme={popup?.popupCloseButtonVariantBoxColor ?? undefined}
        variant={popup?.popupCloseButtonVariant ?? undefined}
        position="absolute"
        top={0}
        right={0}
        m={1}
        p={1}
      >
        {popup?.popupCloseButtonText}
      </Button>

      {popupEngagement?.popupEngagementUniqueIdentifier && (
        <Flex
          direction="column"
          h={popup?.popupTitleAndContentPercentage ?? undefined }
          ml={popup?.popupTextMarginLeft ?? undefined}
          mr={popup?.popupTextMarginRight ?? undefined}
        >
          <Box>
            {popup?.popupTitle && (
              <Box
                p={2}
                mt={2}
                minHeight={popup?.popupTitleHeight ?? undefined}
                width={popup?.popupTitleWidth ?? undefined}
                textColor={popup?.popupTitleTextColor ?? undefined}
              >
                <Text fontSize="3xl" textAlign="center">
                  {popup?.popupTitle}
                </Text>
              </Box>
            )}

            {popup?.popupContent && (
              <Box
                borderColor="black"
                p={4}
                minHeight={popup?.popupContentHeight ?? undefined}
                width={popup?.popupContentWidth ?? undefined}
                textColor={popup?.popupContentTextColor ?? undefined}
              >
                <Text fontWeight="bold">{popup?.popupContent}</Text>
              </Box>
            )}
          </Box>
        </Flex>
      )}

      <Box ref={flexContainerRef} overflowY="scroll" h={popup?.popupChatHistoryPercentage ?? undefined }>
          <Box p={2} m={1}>
            <Flex direction="column">
              {(chatGPTs.length > 0 ? chatGPTs :  [{id: 0, requestId: 0, inputChatGPT: popup?.popupExampleInputChatGPT, outputChatGPT: popup?.popupExampleOutputChatGPT }]).map((chatGPT, index) => (
                <Box key={`${chatGPT.requestId}--${chatGPT.id}--${index}`}>
                  <Flex justifyContent="flex-end">
                    <Box
                      mt={1}
                      px={2}
                      py={1}
                      fontSize="sm"
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
                      textAlign={"left" }
                    >
                      {chatGPTs.length > 0 ? pastChatGPTInput[index] : popup?.popupExampleInputChatGPT}
                    </Box>
                  </Flex>
                  <Flex justifyContent="flex-start">
                    <Box
                      mt={1}
                      px={2}
                      py={1}
                      fontSize="sm"
                      borderRadius="8px 8px 8px 0"
                      borderWidth="1px"
                      borderColor={popup?.popupChatHistoryOutputFocusBorderColor ?? undefined}
                      boxShadow="md"
                      textColor={popup?.popupChatHistoryOutputTextColor ?? undefined}
                      backgroundColor={popup?.popupChatHistoryOutputBoxColor ?? undefined}
                      position="relative"
                      _before={{
                        content: '""',
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "16px",
                        height: "8px",
                        borderTopLeftRadius: 0,
                        backgroundColor: popup?.popupChatHistoryOutputBoxColor ?? undefined,
                      }}
                      textAlign={"right" }
                    >
                      {chatGPT.outputChatGPT }
                    </Box>
                  </Flex>
                </Box>
              ))}
            </Flex>
          </Box>
      </Box>

      <Box h={popup?.popupChatSendPercentage ?? undefined}>
        {chatGPTs.length === 0 && (
          <>
            <Box mx={2}>
              {popupAdditionals?.map((suggestion, idx) => (
                <Button
                  key={`${suggestion.popupAdditionalId }--${idx}`} 
                  size="xs"
                  mt={1}
                  ml={1}
                  onClick={() => handleButtonSubmit(suggestion.popupAdditionalText)}
                >
                  {suggestion.popupAdditionalText}
                </Button>
              ))}
            </Box>
          </>
        )}
      </Box>


        <Box>
        <Flex>
          <Box width="80%">
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
          </Box>
          <Box>
            <Button 
            onClick={handleSubmit} 
            colorScheme={popup?.popupSendButtonColorScheme ?? undefined} 
            m={2} 
            ml={3} 
            textColor={popup?.popupSendButtonTextColor ?? undefined} 
            variant = {popup?.popupSendButtonVariant ?? undefined} 
            color={popup?.popupSendButtonColor ?? undefined} >
            {popup?.popupSendButtonText ?? 'Send'}
            </Button>
          </Box>
        </Flex>
        </Box>

    </Box>
  </Flex>
)}

</>


  );
};

export default SoftapyWidget;
