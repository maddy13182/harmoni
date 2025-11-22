/**
 * RolePicker Component
 * 
 * Purpose: Dropdown picker for selecting user roles in family groups
 * Options: admin, owner, member, readonly
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface RolePickerProps {
  selectedRole: string;
  onSelectRole: (role: string) => void;
  label?: string;
  required?: boolean;
}

const ROLES = [
  { value: 'owner', label: 'Owner', icon: 'shield-checkmark', description: 'Full control of the calendar' },
  { value: 'admin', label: 'Admin', icon: 'key', description: 'Can manage members and events' },
  { value: 'member', label: 'Member', icon: 'person', description: 'Can create and edit events' },
  { value: 'readonly', label: 'Read Only', icon: 'eye', description: 'Can only view events' },
];

export const RolePicker: React.FC<RolePickerProps> = ({
  selectedRole,
  onSelectRole,
  label = 'Role',
  required = false,
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  const selectedRoleData = ROLES.find(r => r.value === selectedRole);

  const handleSelectRole = (role: string) => {
    onSelectRole(role);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.pickerContent}>
          {selectedRoleData ? (
            <>
              <Ionicons name={selectedRoleData.icon as any} size={20} color="#EF7674" />
              <Text style={styles.selectedText}>{selectedRoleData.label}</Text>
            </>
          ) : (
            <Text style={styles.placeholderText}>Select role</Text>
          )}
        </View>
        <Ionicons name="chevron-down" size={20} color={Colors.text.secondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Role</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.roleList}>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleItem,
                    selectedRole === role.value && styles.roleItemSelected,
                  ]}
                  onPress={() => handleSelectRole(role.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.roleIconContainer}>
                    <Ionicons
                      name={role.icon as any}
                      size={24}
                      color={selectedRole === role.value ? '#EF7674' : Colors.text.secondary}
                    />
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={[
                      styles.roleLabel,
                      selectedRole === role.value && styles.roleLabelSelected,
                    ]}>
                      {role.label}
                    </Text>
                    <Text style={styles.roleDescription}>{role.description}</Text>
                  </View>
                  {selectedRole === role.value && (
                    <Ionicons name="checkmark-circle" size={24} color="#EF7674" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  required: {
    color: Colors.semantic.error,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  selectedText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  roleList: {
    padding: Layout.spacing.md,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleItemSelected: {
    borderColor: '#EF7674',
    backgroundColor: '#EF767410',
  },
  roleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  roleLabelSelected: {
    color: '#EF7674',
  },
  roleDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
});

export default RolePicker;
