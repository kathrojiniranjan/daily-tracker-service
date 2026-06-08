import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AuthController } from './authController';
import { RegisterScreenModel, RegisterScreenState } from './registerScreenModel';

export interface RegisterScreenProps {
  authController: AuthController;
  onNavigate: (route: 'Login' | 'Home') => void;
}

export function RegisterScreen(props: RegisterScreenProps): React.JSX.Element {
  const model = useMemo(
    () => new RegisterScreenModel(props.authController),
    [props.authController],
  );
  const [state, setState] = useState<RegisterScreenState>(model.getState());

  const refresh = (): void => setState(model.getState());

  const onSubmit = async (): Promise<void> => {
    try {
      await model.submit();
      refresh();
      props.onNavigate('Home');
    } catch {
      refresh();
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          autoCapitalize='none'
          placeholder='Username'
          style={styles.input}
          value={state.values.username}
          onChangeText={(text) => setState(model.setUsername(text))}
        />
        {state.errors.username ? <Text style={styles.error}>{state.errors.username}</Text> : null}

        <TextInput
          autoCapitalize='none'
          keyboardType='email-address'
          placeholder='Email'
          style={styles.input}
          value={state.values.email}
          onChangeText={(text) => setState(model.setEmail(text))}
        />
        {state.errors.email ? <Text style={styles.error}>{state.errors.email}</Text> : null}

        <TextInput
          autoCapitalize='none'
          secureTextEntry
          placeholder='Password'
          style={styles.input}
          value={state.values.password}
          onChangeText={(text) => setState(model.setPassword(text))}
        />
        {state.errors.password ? <Text style={styles.error}>{state.errors.password}</Text> : null}

        <TextInput
          autoCapitalize='none'
          secureTextEntry
          placeholder='Confirm password'
          style={styles.input}
          value={state.values.confirmPassword}
          onChangeText={(text) => setState(model.setConfirmPassword(text))}
        />
        {state.errors.confirmPassword ? (
          <Text style={styles.error}>{state.errors.confirmPassword}</Text>
        ) : null}

        {state.errors.form ? <Text style={styles.error}>{state.errors.form}</Text> : null}

        <View style={styles.buttonWrap}>
          {state.submitting ? (
            <ActivityIndicator />
          ) : (
            <Button title='Create account' onPress={onSubmit} disabled={!model.canSubmit()} />
          )}
        </View>

        <View style={styles.linkWrap}>
          <Text style={styles.link} onPress={() => props.onNavigate('Login')}>
            Have an account? Login
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    color: '#b91c1c',
    fontSize: 12,
  },
  buttonWrap: {
    marginTop: 8,
  },
  linkWrap: {
    marginTop: 10,
    alignItems: 'center',
  },
  link: {
    color: '#2563eb',
    fontSize: 14,
  },
});
