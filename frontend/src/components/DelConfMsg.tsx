import { useState } from "react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react"; // Adjust icons based on your needs

const DelConfirmMsg = ({
  OnDelete,
  title = "Are you sure?",
  text = "You want to delete this item?",
}: {
  rowId: number;
  OnDelete: (confirmed: boolean) => void;
  title?: string;
  text?: string;
}) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    OnDelete(true);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <TrashIcon className="text-red-600" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <p>{text}</p>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Yes, Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DelConfirmMsg;
