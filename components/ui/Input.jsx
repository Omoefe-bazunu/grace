// import React from 'react';
// import { TextInput, Text, View, StyleSheet } from 'react-native';
// import { useTheme } from '../../contexts/ThemeContext';

// export function Input({ label, error, style, ...props }) {
//   const { colors } = useTheme();

//   return (
//     <View style={styles.container}>
//       {label && (
//         <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
//       )}
//       <TextInput
//         style={[
//           styles.input,
//           {
//             borderColor: error ? colors.error : colors.border,
//             backgroundColor: colors.surface,
//             color: colors.text,
//           },
//           style,
//         ]}
//         placeholderTextColor={colors.textSecondary}
//         {...props}
//       />
//       {error && (
//         <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     fontSize: 16,
//   },
//   error: {
//     fontSize: 14,
//     marginTop: 4,
//   },
// });

// components/ui/Input.jsx
import React, { useState } from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Eye, EyeOff } from 'lucide-react-native';

export function Input({
  label,
  error,
  secureTextEntry: secureProp,
  style,
  ...props
}) {
  const { colors } = useTheme();
  const [secure, setSecure] = useState(!!secureProp);
  const isSecure = secureProp && secure;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: error ? colors.error : colors.border,
              backgroundColor: colors.surface,
              color: colors.text,
              paddingRight: secureProp ? 48 : 16,
            },
            style,
          ]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isSecure}
          {...props}
        />
        {secureProp && (
          <TouchableOpacity
            style={styles.icon}
            onPress={() => setSecure(!secure)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {secure ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  icon: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  error: {
    fontSize: 14,
    marginTop: 4,
  },
});
