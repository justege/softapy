import React, { useEffect, useState } from 'react';
import { Button, Box, Image } from '@chakra-ui/react';
import { baseUrl } from './shared';

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
  nestedComponents: PopupComponent[]; // Array of nested components
  layout?: 'horizontal' | 'vertical'; // Optional property to specify layout direction
}

export const PopupCustomizationPage = (props: { componentId: number }) => {
  const [popupData, setPopupData] = useState<PopupComponent | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseUrl}popup-component/${props.componentId}`, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw Error(response.statusText);
        }

        const data = await response.json();
        console.log('Fetched popupData:', data); // Add this line to log the fetched data
        setPopupData(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
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

  const renderNestedComponents = (
    components: PopupComponent[],
    parentLayout: 'horizontal' | 'vertical' = 'vertical' // Default to vertical layout
  ): JSX.Element => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: parentLayout === 'horizontal' ? 'row' : 'column',
        }}
      >
        {components.map((component) => {
          let renderedComponent = null;

          if (component.component_type === 'button') {
            renderedComponent = (
              <Button
                style={{
                  position: 'relative', // Use 'relative' instead of 'absolute'
                  left: component.position_x, // Use the original x position
                  top: component.position_y, // Use the original y position
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
                  overflow: 'hidden', // Clip any overflow content
                }}
              >
                {component.content}
                {renderNestedComponents(component.nestedComponents, component.layout)}
              </Button>
            );
          } else if (component.component_type === 'text') {
            renderedComponent = (
              <Box
                style={{
                  position: 'relative', // Use 'relative' instead of 'absolute'
                  left: component.position_x, // Use the original x position
                  top: component.position_y, // Use the original y position
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
                  overflow: 'hidden', // Clip any overflow content
                }}
              >
                {component.content}
                {renderNestedComponents(component.nestedComponents, component.layout)}
              </Box>
            );
          } else if (component.component_type === 'image') {
            renderedComponent = (
              <Image
                src={component.image_url}
                style={{
                  position: 'relative', // Use 'relative' instead of 'absolute'
                  left: component.position_x, // Use the original x position
                  top: component.position_y, // Use the original y position
                  width: component.width,
                  height: component.height,
                  zIndex: component.z_index,
                  gridRow: component.grid_row,
                  gridColumn: component.grid_column,
                  overflow: 'hidden', // Clip any overflow content
                }}
              />
            );
          }

          return (
            <div
              key={component.id}
              onClick={() => handleClick(component.click_handler!)}
              onMouseEnter={() => handleHover(component.hover_handler!)}
            >
              {renderedComponent}
            </div>
          );
        })}
      </div>
    );
  };

  // Inside the return statement of the `PopupCustomizationPage` component
  return (
    <div>
      {popupData && renderNestedComponents([popupData], popupData.layout || 'vertical')} {/* Initial parent position is (0, 0) */}
    </div>
  );
};
