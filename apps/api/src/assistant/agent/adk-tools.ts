import { FunctionTool } from '@google/adk';
import {
  detailsSchema,
  handleDetails,
  handleOfferChoices,
  handleSearch,
  handleUpdateProfile,
  offerSchema,
  searchSchema,
  updateProfileSchema,
  type ToolContext,
} from './tools';

/** ADK FunctionTools over the per-request tool handlers. */
export function createTools(ctx: ToolContext) {
  return [
    new FunctionTool({
      name: 'update_profile',
      description:
        'Record facts the person shared about their situation (needs, region, age, children, circumstances). Call this before searching whenever you learn something new.',
      parameters: updateProfileSchema,
      execute: (args) => handleUpdateProfile(ctx, args),
    }),
    new FunctionTool({
      name: 'search_programs',
      description:
        'Search the verified-program database with the current profile. Returns ranked programs with fit labels and reasons. The only source of programs you may mention.',
      parameters: searchSchema,
      execute: (args) => handleSearch(ctx, args),
    }),
    new FunctionTool({
      name: 'get_program_details',
      description: 'Eligibility, required documents, how to apply and status for one program from the latest search.',
      parameters: detailsSchema,
      execute: (args) => handleDetails(ctx, args),
    }),
    new FunctionTool({
      name: 'offer_choices',
      description:
        'Show tappable answer buttons for a question about: need (kind of support), region, age, or situation. Use it whenever you ask one of these.',
      parameters: offerSchema,
      execute: (args) => handleOfferChoices(ctx, args),
    }),
  ];
}
