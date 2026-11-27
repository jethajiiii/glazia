import { z } from 'zod';
import { ELEMENT_TYPES, CANVAS_LIMITS } from '../constants/canvasConstants.js';

/**
 * Common base schema shared across all canvas element types.
 */
const baseElementSchema = {
  id: z
    .string({ required_error: 'Element id is required' })
    .trim()
    .min(1, 'Element id cannot be empty'),
  x: z.number({ required_error: 'Element x coordinate is required' }),
  y: z.number({ required_error: 'Element y coordinate is required' }),
  rotation: z
    .number()
    .min(CANVAS_LIMITS.MIN_ROTATION, 'Rotation must be >= -360')
    .max(CANVAS_LIMITS.MAX_ROTATION, 'Rotation must be <= 360')
    .default(0),
  fill: z
    .string()
    .regex(
      CANVAS_LIMITS.HEX_COLOR_REGEX,
      'Fill color must be a valid hex color code (e.g. #3b82f6)',
    )
    .default(CANVAS_LIMITS.DEFAULT_FILL),
};

/**
 * Rectangle element schema requiring positive width and height.
 */
const rectElementSchema = z.object({
  ...baseElementSchema,
  type: z.literal(ELEMENT_TYPES.RECT),
  width: z
    .number({ required_error: 'Width is required for rectangle element' })
    .min(CANVAS_LIMITS.MIN_ELEMENT_DIMENSION, 'Width must be at least 1px')
    .max(CANVAS_LIMITS.MAX_ELEMENT_DIMENSION, 'Width exceeds maximum limit'),
  height: z
    .number({ required_error: 'Height is required for rectangle element' })
    .min(CANVAS_LIMITS.MIN_ELEMENT_DIMENSION, 'Height must be at least 1px')
    .max(CANVAS_LIMITS.MAX_ELEMENT_DIMENSION, 'Height exceeds maximum limit'),
});

/**
 * Circle element schema requiring positive radius.
 */
const circleElementSchema = z.object({
  ...baseElementSchema,
  type: z.literal(ELEMENT_TYPES.CIRCLE),
  radius: z
    .number({ required_error: 'Radius is required for circle element' })
    .min(CANVAS_LIMITS.MIN_ELEMENT_DIMENSION, 'Radius must be at least 1px')
    .max(CANVAS_LIMITS.MAX_ELEMENT_DIMENSION, 'Radius exceeds maximum limit'),
});

/**
 * Text element schema requiring text content and font size within bounds.
 */
const textElementSchema = z.object({
  ...baseElementSchema,
  type: z.literal(ELEMENT_TYPES.TEXT),
  text: z.string({ required_error: 'Text content is required' }),
  fontSize: z
    .number({ required_error: 'Font size is required for text element' })
    .min(CANVAS_LIMITS.MIN_FONT_SIZE, 'Font size must be at least 6')
    .max(CANVAS_LIMITS.MAX_FONT_SIZE, 'Font size cannot exceed 200'),
});

/**
 * Type-aware discriminated union validating elements according to their type.
 */
export const elementSchema = z.discriminatedUnion('type', [
  rectElementSchema,
  circleElementSchema,
  textElementSchema,
]);

/**
 * Schema validating MongoDB 24-character hexadecimal ObjectId path parameters.
 */
export const canvasIdParamSchema = {
  params: z.object({
    id: z
      .string()
      .regex(
        CANVAS_LIMITS.OBJECT_ID_REGEX,
        'Invalid canvas ID format. Must be a 24-character hexadecimal string',
      ),
  }),
};

/**
 * Schema validating canvas creation payload.
 */
export const createCanvasSchema = {
  body: z.object({
    name: z
      .string({ required_error: 'Canvas name is required' })
      .trim()
      .min(CANVAS_LIMITS.NAME_MIN_LENGTH, 'Canvas name must contain at least 1 character')
      .max(CANVAS_LIMITS.NAME_MAX_LENGTH, 'Canvas name cannot exceed 100 characters'),
    width: z
      .number()
      .min(CANVAS_LIMITS.MIN_WIDTH, 'Width must be at least 100')
      .max(CANVAS_LIMITS.MAX_WIDTH, 'Width cannot exceed 10000')
      .default(CANVAS_LIMITS.DEFAULT_WIDTH),
    height: z
      .number()
      .min(CANVAS_LIMITS.MIN_HEIGHT, 'Height must be at least 100')
      .max(CANVAS_LIMITS.MAX_HEIGHT, 'Height cannot exceed 10000')
      .default(CANVAS_LIMITS.DEFAULT_HEIGHT),
    elements: z.array(elementSchema).default([]),
  }),
};

/**
 * Schema validating canvas update payload.
 */
export const updateCanvasSchema = {
  params: canvasIdParamSchema.params,
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(CANVAS_LIMITS.NAME_MIN_LENGTH, 'Canvas name must contain at least 1 character')
        .max(CANVAS_LIMITS.NAME_MAX_LENGTH, 'Canvas name cannot exceed 100 characters')
        .optional(),
      width: z
        .number()
        .min(CANVAS_LIMITS.MIN_WIDTH, 'Width must be at least 100')
        .max(CANVAS_LIMITS.MAX_WIDTH, 'Width cannot exceed 10000')
        .optional(),
      height: z
        .number()
        .min(CANVAS_LIMITS.MIN_HEIGHT, 'Height must be at least 100')
        .max(CANVAS_LIMITS.MAX_HEIGHT, 'Height cannot exceed 10000')
        .optional(),
      elements: z.array(elementSchema).optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      'At least one field (name, width, height, elements) must be provided for update',
    ),
};
