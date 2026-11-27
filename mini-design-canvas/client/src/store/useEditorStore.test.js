import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from './useEditorStore.js';
import {
  selectSelectedElement,
  selectElementById,
  selectIsDirty,
  selectElements,
  selectSelectedId,
  selectCanUndo,
  selectCanRedo,
} from './selectors.js';
import { ELEMENT_TYPES } from '../constants/elementTypes.js';
import { CANVAS_DEFAULTS } from '../constants/defaults.js';
import { resetSpawnCounter } from '../utils/elementFactory.js';

describe('useEditorStore', () => {
  beforeEach(() => {
    resetSpawnCounter();
    // Reset store state prior to each test
    useEditorStore.getState().resetCanvas();
  });

  it('initializes with clean default state', () => {
    const state = useEditorStore.getState();

    expect(state.canvasId).toBeNull();
    expect(state.canvasName).toBe(CANVAS_DEFAULTS.NAME);
    expect(state.elements).toEqual([]);
    expect(state.selectedId).toBeNull();
    expect(state.isDirty).toBe(false);
  });

  it('addElement appends shape, sets selection, and marks dirty', () => {
    const { addElement } = useEditorStore.getState();

    const created = addElement(ELEMENT_TYPES.RECT);
    const state = useEditorStore.getState();

    expect(state.elements).toHaveLength(1);
    expect(state.elements[0].id).toBe(created.id);
    expect(state.selectedId).toBe(created.id);
    expect(state.isDirty).toBe(true);
  });

  it('updateElement immutably patches the target shape and marks dirty', () => {
    const { addElement, updateElement } = useEditorStore.getState();

    const rect = addElement(ELEMENT_TYPES.RECT);
    const initialElementsRef = useEditorStore.getState().elements;

    updateElement(rect.id, { width: 300, fill: '#ff5722' });
    const state = useEditorStore.getState();

    expect(state.elements).not.toBe(initialElementsRef); // Immutability
    expect(state.elements[0].width).toBe(300);
    expect(state.elements[0].fill).toBe('#ff5722');
    expect(state.isDirty).toBe(true);
  });

  it('updateElement ignores non-existent element IDs without throwing', () => {
    const { updateElement } = useEditorStore.getState();

    expect(() => updateElement('non-existent-id', { width: 100 })).not.toThrow();
  });

  it('deleteElement removes specified element and clears selection if selected', () => {
    const { addElement, deleteElement } = useEditorStore.getState();

    const el1 = addElement(ELEMENT_TYPES.RECT);
    const el2 = addElement(ELEMENT_TYPES.CIRCLE);

    expect(useEditorStore.getState().elements).toHaveLength(2);
    expect(useEditorStore.getState().selectedId).toBe(el2.id);

    deleteElement(el2.id);
    const state = useEditorStore.getState();

    expect(state.elements).toHaveLength(1);
    expect(state.elements[0].id).toBe(el1.id);
    expect(state.selectedId).toBeNull(); // Cleared because deleted element was selected
    expect(state.isDirty).toBe(true);
  });

  it('deleteElement deletes currently selected element when no ID is passed', () => {
    const { addElement, deleteElement } = useEditorStore.getState();

    addElement(ELEMENT_TYPES.TEXT);
    expect(useEditorStore.getState().elements).toHaveLength(1);

    deleteElement(); // No ID passed
    expect(useEditorStore.getState().elements).toHaveLength(0);
    expect(useEditorStore.getState().selectedId).toBeNull();
  });

  it('selectElement and clearSelection update selectedId without marking dirty', () => {
    const { addElement, selectElement, clearSelection, markSaved } = useEditorStore.getState();

    const el = addElement(ELEMENT_TYPES.RECT);
    markSaved(); // Clear dirty flag

    expect(useEditorStore.getState().isDirty).toBe(false);

    clearSelection();
    expect(useEditorStore.getState().selectedId).toBeNull();
    expect(useEditorStore.getState().isDirty).toBe(false); // Non-mutating

    selectElement(el.id);
    expect(useEditorStore.getState().selectedId).toBe(el.id);
    expect(useEditorStore.getState().isDirty).toBe(false); // Non-mutating
  });

  it('loadCanvas populates saved canvas, clears selection and marks not dirty', () => {
    const { loadCanvas } = useEditorStore.getState();

    const mockSavedCanvas = {
      _id: '67475d4f18e9a2b8e4000001',
      name: 'Architectural Blueprint',
      elements: [
        {
          id: '1',
          type: 'rect',
          x: 20,
          y: 20,
          width: 100,
          height: 100,
          fill: '#000000',
          rotation: 0,
        },
        { id: '2', type: 'circle', x: 200, y: 150, radius: 40, fill: '#ff0000', rotation: 0 },
      ],
    };

    loadCanvas(mockSavedCanvas);
    const state = useEditorStore.getState();

    expect(state.canvasId).toBe('67475d4f18e9a2b8e4000001');
    expect(state.canvasName).toBe('Architectural Blueprint');
    expect(state.elements).toHaveLength(2);
    expect(state.selectedId).toBeNull();
    expect(state.isDirty).toBe(false);
  });

  it('resetCanvas restores blank state with clean name', () => {
    const { addElement, resetCanvas } = useEditorStore.getState();

    addElement(ELEMENT_TYPES.RECT);
    resetCanvas('Brand New Project');
    const state = useEditorStore.getState();

    expect(state.canvasId).toBeNull();
    expect(state.canvasName).toBe('Brand New Project');
    expect(state.elements).toEqual([]);
    expect(state.selectedId).toBeNull();
    expect(state.isDirty).toBe(false);
  });

  it('setCanvasName updates name and marks dirty', () => {
    const { setCanvasName } = useEditorStore.getState();

    setCanvasName('Updated Canvas Name');
    const state = useEditorStore.getState();

    expect(state.canvasName).toBe('Updated Canvas Name');
    expect(state.isDirty).toBe(true);
  });

  it('markSaved clears isDirty and sets canvasId', () => {
    const { addElement, markSaved } = useEditorStore.getState();

    addElement(ELEMENT_TYPES.RECT);
    expect(useEditorStore.getState().isDirty).toBe(true);

    markSaved({ _id: 'newly-created-mongo-id' });
    const state = useEditorStore.getState();

    expect(state.isDirty).toBe(false);
    expect(state.canvasId).toBe('newly-created-mongo-id');
  });

  describe('Layer Ordering & History', () => {
    it('bringForward moves element forward and records history', () => {
      const { addElement, bringForward, undo } = useEditorStore.getState();
      const el1 = addElement(ELEMENT_TYPES.RECT);
      const el2 = addElement(ELEMENT_TYPES.CIRCLE);
      const el3 = addElement(ELEMENT_TYPES.TEXT);

      // Current order: [el1, el2, el3]
      bringForward(el1.id);
      expect(useEditorStore.getState().elements.map((e) => e.id)).toEqual([el2.id, el1.id, el3.id]);

      // Undo reorder
      undo();
      expect(useEditorStore.getState().elements.map((e) => e.id)).toEqual([el1.id, el2.id, el3.id]);
    });

    it('sendBackward moves element backward and records history', () => {
      const { addElement, sendBackward } = useEditorStore.getState();
      const el1 = addElement(ELEMENT_TYPES.RECT);
      const el2 = addElement(ELEMENT_TYPES.CIRCLE);

      sendBackward(el2.id);
      expect(useEditorStore.getState().elements.map((e) => e.id)).toEqual([el2.id, el1.id]);
    });

    it('bringToFront moves element directly to end', () => {
      const { addElement, bringToFront } = useEditorStore.getState();
      const el1 = addElement(ELEMENT_TYPES.RECT);
      const el2 = addElement(ELEMENT_TYPES.CIRCLE);
      const el3 = addElement(ELEMENT_TYPES.TEXT);

      bringToFront(el1.id);
      expect(useEditorStore.getState().elements.map((e) => e.id)).toEqual([el2.id, el3.id, el1.id]);
    });

    it('sendToBack moves element directly to index 0', () => {
      const { addElement, sendToBack } = useEditorStore.getState();
      const el1 = addElement(ELEMENT_TYPES.RECT);
      const el2 = addElement(ELEMENT_TYPES.CIRCLE);
      const el3 = addElement(ELEMENT_TYPES.TEXT);

      sendToBack(el3.id);
      expect(useEditorStore.getState().elements.map((e) => e.id)).toEqual([el3.id, el1.id, el2.id]);
    });

    it('undo and redo reliably reverses add, update, delete, and reorder', () => {
      const { addElement, updateElement, deleteElement, undo, redo } = useEditorStore.getState();

      const el = addElement(ELEMENT_TYPES.RECT);
      expect(useEditorStore.getState().elements).toHaveLength(1);

      updateElement(el.id, { width: 500 });
      expect(useEditorStore.getState().elements[0].width).toBe(500);

      // Undo update
      undo();
      expect(useEditorStore.getState().elements[0].width).not.toBe(500);

      // Redo update
      redo();
      expect(useEditorStore.getState().elements[0].width).toBe(500);

      // Delete element
      deleteElement(el.id);
      expect(useEditorStore.getState().elements).toHaveLength(0);

      // Undo delete
      undo();
      expect(useEditorStore.getState().elements).toHaveLength(1);

      // Redo delete
      redo();
      expect(useEditorStore.getState().elements).toHaveLength(0);
    });

    it('loadCanvas resets history stacks', () => {
      const { addElement, loadCanvas } = useEditorStore.getState();
      addElement(ELEMENT_TYPES.RECT);

      expect(selectCanUndo(useEditorStore.getState())).toBe(true);

      loadCanvas({ _id: '123', name: 'Loaded Canvas', elements: [] });
      expect(selectCanUndo(useEditorStore.getState())).toBe(false);
      expect(selectCanRedo(useEditorStore.getState())).toBe(false);
    });
  });

  describe('Selectors', () => {
    it('selectSelectedElement returns element when selected, or null when none selected', () => {
      const { addElement, clearSelection } = useEditorStore.getState();

      const el = addElement(ELEMENT_TYPES.RECT);
      const state = useEditorStore.getState();

      const selected = selectSelectedElement(state);
      expect(selected).toBeDefined();
      expect(selected?.id).toBe(el.id);

      clearSelection();
      const updatedState = useEditorStore.getState();
      expect(selectSelectedElement(updatedState)).toBeNull();
    });

    it('selectElementById returns matching element or null', () => {
      const { addElement } = useEditorStore.getState();

      const el = addElement(ELEMENT_TYPES.CIRCLE);
      const state = useEditorStore.getState();

      const found = selectElementById(el.id)(state);
      expect(found).toBeDefined();
      expect(found?.type).toBe(ELEMENT_TYPES.CIRCLE);

      const notFound = selectElementById('unknown-id')(state);
      expect(notFound).toBeNull();
    });

    it('selectIsDirty and selectElements isolate slices', () => {
      const state = useEditorStore.getState();

      expect(selectIsDirty(state)).toBe(false);
      expect(selectElements(state)).toEqual([]);
      expect(selectSelectedId(state)).toBeNull();
    });
  });
});
