import { useState, useEffect } from 'react';
import { Modal, Button, TextInput, useToast } from '../ui/index.js';
import { useCanvasActions } from '../../hooks/useCanvasActions.js';
import { CANVAS_DEFAULTS } from '../../constants/defaults.js';

/**
 * Modal dialog for creating a brand-new canvas directly via the API.
 * Ensures the newly created canvas immediately has a database ID before editing.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is displayed
 * @param {() => void} props.onClose - Modal close handler
 */
export function NewCanvasModal({ isOpen, onClose }) {
  const toast = useToast();
  const { createNew, isCreating, isDirty } = useCanvasActions();

  const [name, setName] = useState('');
  const [validationError, setValidationError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setValidationError('');
    }
  }, [isOpen]);

  const handleCreate = async (e) => {
    e?.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError('Canvas name is required.');
      return;
    }

    if (trimmed.length > CANVAS_DEFAULTS.NAME_MAX_LENGTH) {
      setValidationError(
        `Canvas name cannot exceed ${CANVAS_DEFAULTS.NAME_MAX_LENGTH} characters.`,
      );
      return;
    }

    if (
      isDirty &&
      !window.confirm(
        'You have unsaved changes on the current canvas. Creating a new one will discard them. Continue?',
      )
    ) {
      return;
    }

    try {
      const created = await createNew(trimmed);
      toast.success(`Created new canvas "${created.name}"`);
      onClose();
    } catch (err) {
      setValidationError(err.message || 'Failed to create canvas.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Canvas"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            isLoading={isCreating}
            onClick={handleCreate}
          >
            Create Design
          </Button>
        </>
      }
    >
      <form onSubmit={handleCreate} className="new-canvas-form">
        <TextInput
          id="new-canvas-name"
          label="Canvas Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (validationError) setValidationError('');
          }}
          placeholder="e.g., Marketing Banner"
          error={validationError}
          helperText={`Between 1 and ${CANVAS_DEFAULTS.NAME_MAX_LENGTH} characters`}
          autoFocus
        />
      </form>
    </Modal>
  );
}
