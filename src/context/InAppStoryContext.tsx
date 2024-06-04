import * as React from 'react';
import { useState, useCallback, createContext } from 'react';
import { useEvents } from '../hooks/useEvents';

export const InAppStoryContext = createContext({
  events: [],
  tags: [],
  placeholders: [],
  imagePlaceholders: [],
  lang: '',
  userID: '',
});

export const useInAppStoryContext = function (props) {
  const [test, setTest] = useState(props.test || 'Hello world');
  const [tags, setTags] = useState([]);
  const [placeholders, setPlaceholders] = useState([]);
  const [imagePlaceholders, setImagePlaceholders] = useState();
  const [lang, setLang] = useState('en_US');
  const [userID, setUserID] = useState('en_US');
  const [apiKey, setApiKey] = useState('en_US');

  const events = useEvents();
  const toggleTest = useCallback(() => {
    setTest((_test) => (_test === 'Hi' ? 'You are awesome' : 'Hi'));
  }, []);

  return {
    test,
    events,
    tags,
    placeholders,
    imagePlaceholders,
    lang,
    userID,
    apiKey,
    setTags,
    setPlaceholders,
    setImagePlaceholders,
    setLang,
    setUserID,
    setApiKey,
    toggleTest,
  };
};

export const InAppStoryProvider = ({ children, ...props }) => {
  const context = useInAppStoryContext(props);
  return (
    <InAppStoryContext.Provider value={context}>
      {children}
    </InAppStoryContext.Provider>
  );
};
