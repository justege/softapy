import React, { useEffect, useState } from 'react';
import { Button, Box, Input, Image, Flex, Spacer } from '@chakra-ui/react';
import { baseUrl} from './shared'

interface PopupComponent {
  id: number;
  component_type: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  content: string;
  font_size?: number;
  background_color?: string;
  text_color?: string;
  border_color?: string;
  border_width?: number;
  border_radius?: number;
  box_shadow?: string;
  click_handler?: string | null;
  hover_handler?: string | null;
  disabled?: boolean;
  image_url?: string;
  link_url?: string;
  input_value?: string;
  z_index?: number;
  grid_row?: string;
  grid_column?: string;
}

interface PopupData {
  id: number;
  // Add other popup attributes as needed
  components: PopupComponent[];
}

export const PopupCustomizationPage = (props: { componentId: number }) => {
  const [popupData, setPopupData] = useState<PopupData | null>(null);

  useEffect(() => {
    // Fetch the popup data from the backend using the proxy
    fetch(`${baseUrl}popup-component/${props.componentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response.json();
      })
      .then((data) => setPopupData(data))
      .catch((error) => console.error(error));
  }, [props.componentId]);

  const handleClick = (handler: string | null) => {
    // Handle the click event based on the click_handler value
    if (handler === 'custom_function_1') {
      // Call a custom function or perform some action
      console.log('Custom Function 1 executed');
    } else if (handler === 'custom_function_2') {
      // Call another custom function or perform a different action
      console.log('Custom Function 2 executed');
    }
    // Add other cases as needed for different click handlers
  };

  const handleHover = (handler: string | null) => {
    // Handle the hover event based on the hover_handler value
    if (handler === 'custom_function_hover_1') {
      // Call a custom function or perform some action on hover
      console.log('Custom Function on Hover 1 executed');
    } else if (handler === 'custom_function_hover_2') {
      // Call another custom function or perform a different action on hover
      console.log('Custom Function on Hover 2 executed');
    }
    // Add other cases as needed for different hover handlers
  };

  if (!popupData) {
    return null;
  }

  return (
    <div>
      {popupData.components.map((component) => (
        <div
          key={component.id}
          onClick={() => handleClick(component.click_handler!)}
          onMouseEnter={() => handleHover(component.hover_handler!)}
          // Add other event handlers as needed
        >
          {component.component_type === 'button' && (
            <Button
              style={{
                position: 'absolute',
                left: component.position_x,
                top: component.position_y,
                width: component.width,
                height: component.height,
                fontSize: component.font_size,
                backgroundColor: component.background_color,
                color: component.text_color,
                borderColor: component.border_color,
                borderWidth: component.border_width,
                borderRadius: component.border_radius,
                boxShadow: component.box_shadow,
                zIndex: component.z_index,
                gridRow: component.grid_row,
                gridColumn: component.grid_column,
              }}
            >
              {component.content}
            </Button>
          )}

          {component.component_type === 'text' && (
            <Box
              style={{
                position: 'absolute',
                left: component.position_x,
                top: component.position_y,
                width: component.width,
                height: component.height,
                fontSize: component.font_size,
                backgroundColor: component.background_color,
                color: component.text_color,
                borderColor: component.border_color,
                borderWidth: component.border_width,
                borderRadius: component.border_radius,
                boxShadow: component.box_shadow,
                zIndex: component.z_index,
                gridRow: component.grid_row,
                gridColumn: component.grid_column,
              }}
            >
              {component.content}
            </Box>
          )}

          {component.component_type === 'image' && (
            <Image
              src={component.image_url}
              style={{
                position: 'absolute',
                left: component.position_x,
                top: component.position_y,
                width: component.width,
                height: component.height,
                zIndex: component.z_index,
                gridRow: component.grid_row,
                gridColumn: component.grid_column,
              }}
            />
          )}

          {/* Add other component types as needed */}
        </div>
      ))}
    </div>
  );
};

