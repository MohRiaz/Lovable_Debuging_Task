import { useState } from "react";
import { Mail, User, CheckCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateLeadForm, ValidationError } from "@/lib/validation";
import { useLeadStore } from "@/lib/lead-store";

type FormState = {
  name: string;
  email: string;
  industry: string;
};

const SuccessView = ({
  onReset,
  leadCount,
}: {
  onReset: () => void;
  leadCount: number;
}) => (
  <div className="w-full max-w-md mx-auto">
    <div className="bg-gradient-card p-8 rounded-2xl shadow-card border border-border backdrop-blur-sm animate-slide-up text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow animate-glow">
          <CheckCircle className="w-10 h-10 text-primary-foreground" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-foreground mb-3">
        Welcome aboard! 🎉
      </h2>
      <p className="text-muted-foreground mb-2">
        Thanks for joining! We'll be in touch soon with updates.
      </p>
      <p className="text-sm text-accent mb-8">
        You're #{leadCount} in this session
      </p>

      <div className="space-y-4">
        <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-sm text-foreground">
            💡 <strong>What's next?</strong>
            <br />
            We'll send you exclusive updates, early access, and
            behind-the-scenes content.
          </p>
        </div>

        <Button
          onClick={onReset}
          variant="outline"
          className="w-full border-border hover:bg-accent/10 transition-smooth group"
        >
          Submit Another Lead
          <User className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Follow our journey on social media for real-time updates
        </p>
      </div>
    </div>
  </div>
);

const FormHeader = () => (
  <div className="text-center mb-8">
    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
      <Mail className="w-8 h-8 text-primary-foreground" />
    </div>
    <h2 className="text-2xl font-bold text-foreground mb-2">
      Join Our Community
    </h2>
    <p className="text-muted-foreground">Be the first to know when we launch</p>
  </div>
);

const FormInput = ({
  icon: Icon,
  field,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: {
  icon: React.ComponentType<{ className?: string }>;
  field: string;
  value: string;
  onChange: (field: string, value: string) => void;
  placeholder: string;
  error?: string;
  type?: string;
}) => (
  <div className="space-y-2">
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className={`pl-10 h-12 bg-input border-border text-foreground placeholder:text-muted-foreground transition-smooth
          ${
            error
              ? "border-destructive"
              : "focus:border-accent focus:shadow-glow"
          }
        `}
      />
    </div>
    {error && (
      <p className="text-destructive text-sm animate-fade-in">{error}</p>
    )}
  </div>
);

const IndustrySelect = ({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) => (
  <div className="space-y-2">
    <div className="relative">
      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={`pl-10 h-12 bg-input border-border text-foreground transition-smooth
            ${
              error
                ? "border-destructive"
                : "focus:border-accent focus:shadow-glow"
            }
          `}
        >
          <SelectValue placeholder="Select your industry" />
        </SelectTrigger>
        <SelectContent>
          {[
            "Technology",
            "Healthcare",
            "Finance",
            "Education",
            "Retail & E-commerce",
            "Manufacturing",
            "Consulting",
            "Other",
          ].map((item) => (
            <SelectItem key={item.toLowerCase()} value={item.toLowerCase()}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    {error && (
      <p className="text-destructive text-sm animate-fade-in">{error}</p>
    )}
  </div>
);

const submitLeadData = async (formData: FormState) => {
  const response = await fetch(
    "https://ytyopyznqpnylebzibby.supabase.co/functions/v1/clever-task",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0eW9weXpucXBueWxlYnppYmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTI3NTUsImV4cCI6MjA3MDEyODc1NX0.nr9WV_ybqZ6PpWT6GjAQm0Bsdr-Q5IejEhToV34VY4E`,
      },
      body: JSON.stringify(formData),
    }
  );

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || "Function call failed");
  }

  return response.json();
};

export const LeadCaptureForm = () => {
  const [formState, setFormState] = useState<FormState>({
    name: "",
    email: "",
    industry: "",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { leads, addLead } = useLeadStore();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateLeadForm(formState);
    setValidationErrors(errors);

    if (errors.length > 0) return;

    try {
      await submitLeadData(formState);
      const newLead = {
        ...formState,
        submitted_at: new Date().toISOString(),
      };
      await addLead(newLead);
      setIsSubmitted(true);
      setFormState({ name: "", email: "", industry: "" });
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const updateFormField = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) =>
      prev.filter((error) => error.field !== field)
    );
  };

  const getErrorForField = (field: string) =>
    validationErrors.find((error) => error.field === field)?.message;

  if (isSubmitted) {
    return (
      <SuccessView
        onReset={() => setIsSubmitted(false)}
        leadCount={leads.length}
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-card p-8 rounded-2xl shadow-card border border-border backdrop-blur-sm animate-slide-up">
        <FormHeader />

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <FormInput
            icon={User}
            field="name"
            value={formState.name}
            onChange={updateFormField}
            placeholder="Your name"
            error={getErrorForField("name")}
          />

          <FormInput
            icon={Mail}
            field="email"
            value={formState.email}
            onChange={updateFormField}
            placeholder="your@email.com"
            error={getErrorForField("email")}
            type="email"
          />

          <IndustrySelect
            value={formState.industry}
            onChange={(value) => updateFormField("industry", value)}
            error={getErrorForField("industry")}
          />

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-primary text-primary-foreground font-semibold rounded-lg shadow-glow hover:shadow-[0_0_60px_hsl(210_100%_60%/0.3)] transition-smooth transform hover:scale-[1.02]"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Get Early Access
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          By submitting, you agree to receive updates. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
};
