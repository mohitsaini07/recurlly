import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { icons } from '@/constants/icons';

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: any) => void;
}

const CATEGORIES = [
  "Entertainment", "AI Tools", "Developer Tools", 
  "Design", "Productivity", "Cloud", "Music", "Other"
];

const CATEGORY_COLORS: Record<string, string> = {
  "Entertainment": "#ff9a9e",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  "Design": "#f5c542",
  "Productivity": "#b8e8d0",
  "Cloud": "#a1c4fd",
  "Music": "#1DB954",
  "Other": "#e2e8f0"
};

export const CreateSubscriptionModal = ({ visible, onClose, onCreate }: CreateSubscriptionModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const resetForm = () => {
    setName('');
    setPrice('');
    setFrequency('Monthly');
    setCategory(CATEGORIES[0]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const numPrice = parseFloat(price);
    if (!name.trim() || isNaN(numPrice) || numPrice <= 0) return;

    const startDate = dayjs().toISOString();
    const renewalDate = dayjs().add(1, frequency === 'Monthly' ? 'month' : 'year').toISOString();

    const newSub = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      price: numPrice,
      frequency,
      category,
      status: 'active',
      startDate,
      renewalDate,
      icon: icons.wallet,
      billing: frequency,
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS["Other"],
      currency: "USD",
      paymentMethod: "New Card"
    };

    onCreate(newSub);
    handleClose();
  };

  const isValid = name.trim().length > 0 && parseFloat(price) > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View className="modal-overlay">
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={handleClose} />
          
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <TouchableOpacity className="modal-close" onPress={handleClose}>
                <Ionicons name="close" size={20} color="#081126" />
              </TouchableOpacity>
            </View>

            <ScrollView className="modal-body" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className="auth-input"
                  placeholder="e.g. Netflix"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View className="auth-field mt-4">
                <Text className="auth-label">Price</Text>
                <TextInput
                  className="auth-input"
                  placeholder="0.00"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  keyboardType="decimal-pad"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              <View className="auth-field mt-4">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  <TouchableOpacity 
                    className={clsx("picker-option", frequency === 'Monthly' && "picker-option-active")}
                    onPress={() => setFrequency('Monthly')}
                  >
                    <Text className={clsx("picker-option-text", frequency === 'Monthly' && "picker-option-text-active")}>Monthly</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className={clsx("picker-option", frequency === 'Yearly' && "picker-option-active")}
                    onPress={() => setFrequency('Yearly')}
                  >
                    <Text className={clsx("picker-option-text", frequency === 'Yearly' && "picker-option-text-active")}>Yearly</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="auth-field mt-4">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity 
                      key={cat}
                      className={clsx("category-chip", category === cat && "category-chip-active")}
                      onPress={() => setCategory(cat)}
                    >
                      <Text className={clsx("category-chip-text", category === cat && "category-chip-text-active")}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                className={clsx("auth-button mt-8", !isValid && "auth-button-disabled")}
                onPress={handleSubmit}
                disabled={!isValid}
              >
                <Text className="auth-button-text">Add Subscription</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
