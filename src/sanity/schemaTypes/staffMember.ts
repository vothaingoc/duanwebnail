import { defineField, defineType } from 'sanity';

export const staffMember = defineType({
  name: 'staffMember',
  title: 'Staff Member',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: rule => rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: rule => rule.required()
    }),
    defineField({ name: 'position', title: 'Position', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'experience', title: 'Experience', type: 'string' }),
    defineField({ name: 'specialty', title: 'Specialty', type: 'text' }),
    defineField({ name: 'certifications', title: 'Certifications', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true }, validation: rule => rule.required() }),
    defineField({ name: 'introduction', title: 'Card Introduction', type: 'text' }),
    defineField({ name: 'selfIntroduction', title: 'Profile Introduction', type: 'text' }),
    defineField({ name: 'gallery', title: 'Gallery', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'order', title: 'Order', type: 'number', initialValue: 0 }),
    defineField({ name: 'published', title: 'Published', type: 'boolean', initialValue: true })
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'position',
      media: 'photo'
    }
  }
});
