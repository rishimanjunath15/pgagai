// ============================================
// NEXTAUTH API ROUTE - Handles all auth endpoints
// GET & POST /api/auth/* — NextAuth v5 App Router handler
// ============================================
import { handlers } from "@/features/auth/auth";

// Destructure individual handler functions (not the whole AppRouteHandlers object)
export const { GET, POST } = handlers;
