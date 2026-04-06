// Marks specific routes as publicly accessible, bypassing authentication guards,
 //enabling flexible control over secured and open endpoints.
 
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);