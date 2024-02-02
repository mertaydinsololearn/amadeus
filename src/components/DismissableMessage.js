import React, { Component } from 'react'
import { useState } from "react";
import { Message } from 'semantic-ui-react'

export default function DismissableMessage( {header, children})  {
    const [visible, setVisible] = useState(true);

    const handleDismiss = () => {
        setVisible(false);
    }

    return (
        visible &&
        <Message 
              onDismiss={handleDismiss}
                header={header}
                content={children}
      />
    );

}