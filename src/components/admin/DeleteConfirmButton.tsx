import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeleteConfirmButtonProps {
  itemName: string;
  itemType: string;
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
  isDeleting?: boolean;
  className?: string;
  size?: "sm" | "icon";
  showLabel?: boolean;
}

export const DeleteConfirmButton = ({
  itemName,
  itemType,
  onConfirm,
  disabled,
  isDeleting,
  className,
  size = "icon",
  showLabel = false,
}: DeleteConfirmButtonProps) => {
  const label = itemName.trim() || `this ${itemType}`;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className={cn("text-muted-foreground hover:text-destructive", className)}
          disabled={disabled || isDeleting}
          title={`Delete ${itemType}`}
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {showLabel && <span>Delete</span>}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove this {itemType} from the database. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
