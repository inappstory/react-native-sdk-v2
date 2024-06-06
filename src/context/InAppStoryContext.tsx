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
  const [customStoryView, setCustomStoryView] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);

  const toggleTest = useCallback(() => {
    setTest((_test) => (_test === 'Hi' ? 'You are awesome' : 'Hi'));
  }, []);

  return {
    test,
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
    customStoryView,
    setCustomStoryView,
    showFavorites,
    setShowFavorites,
  };
};

export const InAppStoryProvider = ({ children, ...props }) => {
  const context = useInAppStoryContext(props);

  const { events, feeds } = useEvents();
  return (
    <InAppStoryContext.Provider value={{ ...context, events, feeds }}>
      {children}
    </InAppStoryContext.Provider>
  );
};

export function useInAppStory() {
  const context = React.useContext(InAppStoryContext);
  if (!context) throw new Error('Use app context within provider!');
  return context;
}
