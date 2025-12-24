import { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from './themed-text';

type AddressAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
};

// Common address patterns and suggestions (can be enhanced with API)
const getAddressSuggestions = (query: string): string[] => {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase().trim();
  const suggestions: string[] = [];

  // Common street types
  const streetTypes = ['Street', 'Avenue', 'Road', 'Drive', 'Lane', 'Court', 'Place', 'Boulevard', 'Way', 'Circle'];
  const streetTypeMatches = streetTypes.filter(type => 
    type.toLowerCase().includes(lowerQuery) || lowerQuery.includes(type.toLowerCase())
  );

  // Common address patterns
  const commonPatterns = [
    `${query} Street`,
    `${query} Avenue`,
    `${query} Road`,
    `${query} Drive`,
    `${query} Lane`,
  ];

  // Add street type matches
  streetTypeMatches.forEach(type => {
    if (!suggestions.includes(type)) {
      suggestions.push(type);
    }
  });

  // Add common patterns
  commonPatterns.forEach(pattern => {
    if (!suggestions.includes(pattern)) {
      suggestions.push(pattern);
    }
  });

  // If query looks like a number, suggest common street names
  if (/^\d+/.test(query)) {
    const number = query.match(/^\d+/)?.[0];
    if (number) {
      suggestions.push(`${number} Main Street`);
      suggestions.push(`${number} Oak Avenue`);
      suggestions.push(`${number} Park Road`);
    }
  }

  return suggestions.slice(0, 5); // Limit to 5 suggestions
};

export function AddressAutocomplete({ value, onChange, label }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (value && value.length >= 2 && isFocused) {
      const newSuggestions = getAddressSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value, isFocused]);

  const handleChange = (text: string) => {
    onChange(text);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value && value.length >= 2) {
      const newSuggestions = getAddressSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for suggestion selection
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.input, styles.inputMultiline]}
          value={value}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={`Enter ${label.toLowerCase()}`}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(suggestion)}
                >
                  <ThemedText style={styles.suggestionText} lightColor="#1a1f2e">
                    {suggestion}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginBottom: 16,
  },
  label: {
    color: '#1e40af',
    fontWeight: '800',
    fontSize: 14,
  },
  inputContainer: {
    position: 'relative',
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1f2e',
    minHeight: 80,
  },
  inputMultiline: {
    textAlignVertical: 'top',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    maxHeight: 200,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

