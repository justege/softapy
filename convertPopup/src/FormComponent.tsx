import React from 'react';
import { Control, SubmitHandler, useForm , Controller} from 'react-hook-form';
import { Box, Input, Text } from '@chakra-ui/react';
import { Answer } from './Types';

type Props = {
    answers: Answer[];
    watch: () => void;
}

type FieldValues = {
    questionId: number[];
}

const FormComponent = (props: Props) => {
    const { control, handleSubmit, watch } = useForm<FieldValues>();

    return (
      <>
        {props.answers.map(answer => (
          <>
          {answer.answerHasInputField &&
            <Box>
            <Text mb={4} maxH={'40%'}>Please enter your answer</Text>
            <Controller
            key={answer.id}
            control={control}
            name={`questionId.${answer.id}`}
            render={({ field }) => (
              <Input
                maxH={'60%'}
                value={field.value}
                onChange={field.onChange}
                placeholder='Here is a sample placeholder'
                size='sm'
              />
            )}
          />
           </Box>
        }
          </>
        ))}
      </>
    );
  }

export default FormComponent;
