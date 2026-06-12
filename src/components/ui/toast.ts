/**
 * Re-export of Sonner toast helpers.
 * Components/pages import { toast } from this file instead of sonner directly.
 * Lets us swap the underlying library without touching call sites.
 */
export { toast } from "sonner";
