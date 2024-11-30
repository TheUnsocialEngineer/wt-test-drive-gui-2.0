import * as React from 'react';
import { createRoot } from 'react-dom/client';
import Welcome from './Components/Welcome.jsx';

const root = createRoot(document.body);
root.render(<Welcome/>);