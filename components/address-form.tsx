import { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from './themed-text';

type AddressData = {
  apt?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

type AddressFormProps = {
  value: string; // Stored as JSON string or formatted string
  onChange: (value: string) => void;
  label: string;
};

// US States for autocomplete
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

const STATE_ABBREVIATIONS: { [key: string]: string } = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA',
  'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO', 'Montana': 'MT',
  'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM',
  'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
};

// Common cities (can be enhanced with API)
const COMMON_CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
  'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston',
  'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis',
  'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento',
  'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh', 'Miami',
  'Long Beach', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Tampa', 'Arlington',
];

// Common street types
const STREET_TYPES = ['Street', 'Avenue', 'Road', 'Drive', 'Lane', 'Court', 'Place', 'Boulevard', 'Way', 'Circle', 'Parkway'];

const parseAddress = (addressString: string): AddressData => {
  if (!addressString) {
    return { street: '', city: '', state: '', zip: '', apt: '' };
  }

  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(addressString);
    if (parsed.street) {
      return parsed;
    }
  } catch {
    // Not JSON, try to parse as formatted string
  }

  // Try to parse formatted address string
  // Format: "Apt X, 123 Main St, City, State ZIP" or "123 Main St, City, State ZIP"
  const parts = addressString.split(',').map(p => p.trim());
  if (parts.length >= 3) {
    let apt = '';
    let street = parts[0];
    let city = parts[1] || '';
    const stateZip = parts[2] || '';
    
    // Check if first part has apt
    if (street.toLowerCase().startsWith('apt') || street.toLowerCase().startsWith('apartment')) {
      const aptMatch = street.match(/(?:apt|apartment)\s*([^,]+)/i);
      if (aptMatch) {
        apt = aptMatch[1].trim();
        street = parts[1] || '';
        city = parts[2] || '';
      }
    }

    // Parse state and zip
    const stateZipMatch = stateZip.match(/([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/);
    if (stateZipMatch) {
      return {
        apt: apt || '',
        street: street || '',
        city: city || '',
        state: stateZipMatch[1] || '',
        zip: stateZipMatch[2] || '',
      };
    }
  }

  // Fallback: return as street address
  return { street: addressString, city: '', state: '', zip: '', apt: '' };
};

const formatAddress = (address: AddressData): string => {
  const parts: string[] = [];
  if (address.apt) parts.push(`Apt ${address.apt}`);
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state || address.zip) {
    parts.push(`${address.state || ''} ${address.zip || ''}`.trim());
  }
  return parts.join(', ');
};

const getStreetSuggestions = (query: string): string[] => {
  if (!query || query.length < 2) return [];
  const lowerQuery = query.toLowerCase();
  const suggestions: string[] = [];

  // Check for street types
  STREET_TYPES.forEach(type => {
    if (type.toLowerCase().includes(lowerQuery) || lowerQuery.includes(type.toLowerCase())) {
      if (query.match(/^\d+/)) {
        const number = query.match(/^\d+/)?.[0];
        suggestions.push(`${number} ${type}`);
      } else {
        suggestions.push(`${query} ${type}`);
      }
    }
  });

  // Common patterns
  if (/^\d+/.test(query)) {
    const number = query.match(/^\d+/)?.[0];
    STREET_TYPES.slice(0, 3).forEach(type => {
      suggestions.push(`${number} Main ${type}`);
      suggestions.push(`${number} Oak ${type}`);
    });
  }

  return suggestions.slice(0, 5);
};

const getCitySuggestions = (query: string): string[] => {
  if (!query || query.length < 2) return [];
  const lowerQuery = query.toLowerCase();
  return COMMON_CITIES.filter(city => city.toLowerCase().startsWith(lowerQuery)).slice(0, 5);
};

const getStateSuggestions = (query: string): string[] => {
  if (!query || query.length < 1) return [];
  const lowerQuery = query.toLowerCase();
  const matches = US_STATES.filter(state => 
    state.toLowerCase().startsWith(lowerQuery) || 
    STATE_ABBREVIATIONS[state]?.toLowerCase().startsWith(lowerQuery)
  );
  return matches.slice(0, 5).map(state => `${state} (${STATE_ABBREVIATIONS[state]})`);
};

const getZipSuggestions = (query: string, state?: string): string[] => {
  if (!query || query.length < 2) return [];
  // Basic zip code patterns (can be enhanced with API)
  if (/^\d{2,4}$/.test(query)) {
    return [`${query}00`, `${query}01`, `${query}02`].slice(0, 3);
  }
  return [];
};

type AutocompleteFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  suggestions: string[];
  showSuggestions: boolean;
  onSelectSuggestion: (suggestion: string) => void;
  keyboardType?: 'default' | 'numeric';
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput>;
};

function AutocompleteField({
  value,
  onChange,
  placeholder,
  suggestions,
  showSuggestions,
  onSelectSuggestion,
  keyboardType = 'default',
  returnKeyType = 'next',
  onSubmitEditing,
  inputRef,
}: AutocompleteFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.autocompleteContainer}>
      <TextInput
        ref={inputRef}
        style={styles.fieldInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
      />
      {showSuggestions && isFocused && suggestions.length > 0 && (
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
                onPress={() => onSelectSuggestion(suggestion)}
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
  );
}

export function AddressForm({ value, onChange, label }: AddressFormProps) {
  const [address, setAddress] = useState<AddressData>(parseAddress(value));
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [stateSuggestions, setStateSuggestions] = useState<string[]>([]);
  const [zipSuggestions, setZipSuggestions] = useState<string[]>([]);

  const aptRef = useRef<TextInput>(null);
  const streetRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const zipRef = useRef<TextInput>(null);

  useEffect(() => {
    const parsed = parseAddress(value);
    setAddress(parsed);
  }, [value]);

  const updateAddress = (updates: Partial<AddressData>) => {
    const newAddress = { ...address, ...updates };
    setAddress(newAddress);
    // Store as formatted string
    onChange(formatAddress(newAddress));
  };

  const handleStreetChange = (text: string) => {
    updateAddress({ street: text });
    if (text.length >= 2) {
      setStreetSuggestions(getStreetSuggestions(text));
    } else {
      setStreetSuggestions([]);
    }
  };

  const handleCityChange = (text: string) => {
    updateAddress({ city: text });
    if (text.length >= 2) {
      setCitySuggestions(getCitySuggestions(text));
    } else {
      setCitySuggestions([]);
    }
  };

  const handleStateChange = (text: string) => {
    updateAddress({ state: text });
    if (text.length >= 1) {
      setStateSuggestions(getStateSuggestions(text));
    } else {
      setStateSuggestions([]);
    }
  };

  const handleZipChange = (text: string) => {
    updateAddress({ zip: text });
    if (text.length >= 2) {
      setZipSuggestions(getZipSuggestions(text, address.state));
    } else {
      setZipSuggestions([]);
    }
  };

  const handleStreetSelect = (suggestion: string) => {
    updateAddress({ street: suggestion });
    setStreetSuggestions([]);
    cityRef.current?.focus();
  };

  const handleCitySelect = (suggestion: string) => {
    updateAddress({ city: suggestion });
    setCitySuggestions([]);
    stateRef.current?.focus();
  };

  const handleStateSelect = (suggestion: string) => {
    // Extract state abbreviation if available
    const match = suggestion.match(/\(([A-Z]{2})\)/);
    const stateValue = match ? match[1] : suggestion.split(' ')[0];
    updateAddress({ state: stateValue });
    setStateSuggestions([]);
    zipRef.current?.focus();
  };

  const handleZipSelect = (suggestion: string) => {
    updateAddress({ zip: suggestion });
    setZipSuggestions([]);
    zipRef.current?.blur();
  };

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>

      <View style={styles.fieldRow}>
        <View style={styles.aptContainer}>
          <ThemedText style={styles.fieldLabel} lightColor="#4b5563">
            Apt #
          </ThemedText>
          <TextInput
            ref={aptRef}
            style={styles.fieldInput}
            value={address.apt || ''}
            onChangeText={(text) => updateAddress({ apt: text })}
            placeholder="Optional"
            returnKeyType="next"
            onSubmitEditing={() => streetRef.current?.focus()}
          />
        </View>
      </View>

      <View style={styles.fieldRow}>
        <ThemedText style={styles.fieldLabel} lightColor="#4b5563">
          Street Address
        </ThemedText>
        <AutocompleteField
          inputRef={streetRef}
          value={address.street}
          onChange={handleStreetChange}
          placeholder="123 Main Street"
          suggestions={streetSuggestions}
          showSuggestions={streetSuggestions.length > 0}
          onSelectSuggestion={handleStreetSelect}
          returnKeyType="next"
          onSubmitEditing={() => cityRef.current?.focus()}
        />
      </View>

      <View style={styles.fieldRow}>
        <ThemedText style={styles.fieldLabel} lightColor="#4b5563">
          City
        </ThemedText>
        <AutocompleteField
          inputRef={cityRef}
          value={address.city}
          onChange={handleCityChange}
          placeholder="City"
          suggestions={citySuggestions}
          showSuggestions={citySuggestions.length > 0}
          onSelectSuggestion={handleCitySelect}
          returnKeyType="next"
          onSubmitEditing={() => stateRef.current?.focus()}
        />
      </View>

      <View style={styles.fieldRow}>
        <ThemedText style={styles.fieldLabel} lightColor="#4b5563">
          State
        </ThemedText>
        <AutocompleteField
          inputRef={stateRef}
          value={address.state}
          onChange={handleStateChange}
          placeholder="State"
          suggestions={stateSuggestions}
          showSuggestions={stateSuggestions.length > 0}
          onSelectSuggestion={handleStateSelect}
          returnKeyType="next"
          onSubmitEditing={() => zipRef.current?.focus()}
        />
      </View>

      <View style={styles.fieldRow}>
        <ThemedText style={styles.fieldLabel} lightColor="#4b5563">
          ZIP Code
        </ThemedText>
        <AutocompleteField
          inputRef={zipRef}
          value={address.zip}
          onChange={handleZipChange}
          placeholder="12345"
          suggestions={zipSuggestions}
          showSuggestions={zipSuggestions.length > 0}
          onSelectSuggestion={handleZipSelect}
          keyboardType="numeric"
          returnKeyType="done"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 16,
  },
  label: {
    color: '#1e40af',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 4,
  },
  fieldRow: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  aptContainer: {
    width: '40%',
  },
  autocompleteContainer: {
    position: 'relative',
    zIndex: 1,
  },
  fieldInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1f2e',
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
    maxHeight: 150,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

