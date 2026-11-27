import mongoose from 'mongoose';
import { ALLOWED_ELEMENT_TYPES, CANVAS_LIMITS } from '../constants/canvasConstants.js';

/**
 * Sub-schema for individual canvas graphical elements.
 * _id is disabled to preserve frontend-generated UUID string identifiers.
 */
const elementSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, 'Element id is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Element type is required'],
      enum: {
        values: ALLOWED_ELEMENT_TYPES,
        message: 'Invalid element type: {VALUE}. Allowed: ' + ALLOWED_ELEMENT_TYPES.join(', '),
      },
    },
    x: {
      type: Number,
      required: [true, 'Element x coordinate is required'],
      default: 0,
    },
    y: {
      type: Number,
      required: [true, 'Element y coordinate is required'],
      default: 0,
    },
    rotation: {
      type: Number,
      default: 0,
      min: [CANVAS_LIMITS.MIN_ROTATION, 'Rotation cannot be less than -360 degrees'],
      max: [CANVAS_LIMITS.MAX_ROTATION, 'Rotation cannot exceed 360 degrees'],
    },
    fill: {
      type: String,
      default: CANVAS_LIMITS.DEFAULT_FILL,
      match: [
        CANVAS_LIMITS.HEX_COLOR_REGEX,
        'Fill must be a valid hexadecimal color (e.g. #3b82f6)',
      ],
    },
    // Rectangle specific
    width: {
      type: Number,
      min: [CANVAS_LIMITS.MIN_ELEMENT_DIMENSION, 'Width must be at least 1'],
      max: [CANVAS_LIMITS.MAX_ELEMENT_DIMENSION, 'Width cannot exceed 10000'],
    },
    height: {
      type: Number,
      min: [CANVAS_LIMITS.MIN_ELEMENT_DIMENSION, 'Height must be at least 1'],
      max: [CANVAS_LIMITS.MAX_ELEMENT_DIMENSION, 'Height cannot exceed 10000'],
    },
    // Circle specific
    radius: {
      type: Number,
      min: [CANVAS_LIMITS.MIN_ELEMENT_DIMENSION, 'Radius must be at least 1'],
      max: [CANVAS_LIMITS.MAX_ELEMENT_DIMENSION, 'Radius cannot exceed 10000'],
    },
    // Text specific
    text: {
      type: String,
      trim: true,
    },
    fontSize: {
      type: Number,
      min: [CANVAS_LIMITS.MIN_FONT_SIZE, 'Font size must be at least 6'],
      max: [CANVAS_LIMITS.MAX_FONT_SIZE, 'Font size cannot exceed 200'],
    },
  },
  { _id: false },
);

/**
 * Main Canvas Schema representing persisted user designs.
 */
const canvasSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Canvas name is required'],
      trim: true,
      minlength: [CANVAS_LIMITS.NAME_MIN_LENGTH, 'Canvas name must contain at least 1 character'],
      maxlength: [CANVAS_LIMITS.NAME_MAX_LENGTH, 'Canvas name cannot exceed 100 characters'],
    },
    width: {
      type: Number,
      default: CANVAS_LIMITS.DEFAULT_WIDTH,
      min: [CANVAS_LIMITS.MIN_WIDTH, 'Canvas width must be at least 100'],
      max: [CANVAS_LIMITS.MAX_WIDTH, 'Canvas width cannot exceed 10000'],
    },
    height: {
      type: Number,
      default: CANVAS_LIMITS.DEFAULT_HEIGHT,
      min: [CANVAS_LIMITS.MIN_HEIGHT, 'Canvas height must be at least 100'],
      max: [CANVAS_LIMITS.MAX_HEIGHT, 'Canvas height cannot exceed 10000'],
    },
    elements: {
      type: [elementSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Index to optimize listing canvases sorted by last updated timestamp
canvasSchema.index({ updatedAt: -1 });

export const Canvas = mongoose.model('Canvas', canvasSchema);
