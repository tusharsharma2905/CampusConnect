'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { eventService } from '@/services/event.service';
import { aiService } from '@/services/ai.service';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  short_description: z.string().optional(),
  description: z.string().min(20, 'Please provide a detailed description'),
  event_type: z.enum(['online', 'offline', 'hybrid']),
  start_datetime: z.string().min(1, 'Start date is required'),
  end_datetime: z.string().min(1, 'End date is required'),
  registration_deadline: z.string().optional(),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1').optional(),
  eligibility: z.string().optional(),
  rules: z.string().optional(),
  prizes: z.string().optional(),
});

const steps = [
  { id: 'basics', title: 'Basic Info' },
  { id: 'schedule', title: 'Schedule & Venue' },
  { id: 'registration', title: 'Registration' },
  { id: 'details', title: 'Rules & FAQ' },
  { id: 'preview', title: 'Review' },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState('basics');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      short_description: '',
      description: '',
      event_type: 'offline',
      start_datetime: '',
      end_datetime: '',
      capacity: undefined,
    },
  });

  const generateWithAI = async (field: 'description' | 'rules') => {
    toast.info('Generating content with Gemini AI...');
    try {
      const prompt = field === 'description' 
        ? `Write a detailed description for a college event titled: "${form.getValues('title') || 'Awesome Event'}". Include what participants will learn and why they should attend.`
        : `Write rules and guidelines for a college event titled: "${form.getValues('title') || 'Awesome Event'}". Make it a numbered list.`;
        
      const response = await aiService.generateContent(prompt);
      form.setValue(field, response.content);
      toast.success('Content generated successfully!');
    } catch (error) {
      toast.error('Failed to generate content. Please try again or write it manually.');
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Format dates for backend if needed
      const dataToSubmit = {
        ...values,
        start_datetime: new Date(values.start_datetime).toISOString(),
        end_datetime: new Date(values.end_datetime).toISOString(),
        registration_deadline: values.registration_deadline ? new Date(values.registration_deadline).toISOString() : undefined,
      };
      
      const newEvent = await eventService.createEvent(dataToSubmit);
      toast.success('Event created and submitted for approval!');
      router.push(`/organizer/events/${newEvent.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepIndex = steps.findIndex(s => s.id === activeStep);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setActiveStep(steps[currentStepIndex + 1].id);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setActiveStep(steps[currentStepIndex - 1].id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
        <p className="text-muted-foreground mt-1">Design and publish your next campus event.</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 w-full h-0.5 bg-muted -z-10 transform -translate-y-1/2"></div>
          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-colors ${
                  idx < currentStepIndex ? 'bg-primary border-primary text-primary-foreground' : 
                  idx === currentStepIndex ? 'border-primary text-primary' : 'border-muted text-muted-foreground'
                }`}
              >
                {idx < currentStepIndex ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${idx <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeStep} className="w-full">
              
              {/* Step 1: Basics */}
              <TabsContent value="basics" className="p-6 m-0 space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Annual Tech Hackathon 2026" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="short_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="A brief catchphrase for your event" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-2">
                          <FormLabel>Detailed Description</FormLabel>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5"
                            onClick={() => generateWithAI('description')}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Generate with AI
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what your event is about, what participants will learn, etc." 
                            className="min-h-[200px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Step 2: Schedule & Venue */}
              <TabsContent value="schedule" className="p-6 m-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="start_datetime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_datetime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="event_type"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Event Type</FormLabel>
                        <FormControl>
                          <select 
                            {...field}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="offline">In-Person (Offline)</option>
                            <option value="online">Virtual (Online)</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Note: Venue Selection would go here via an API call in a full implementation */}
                </div>
              </TabsContent>

              {/* Step 3: Registration */}
              <TabsContent value="registration" className="p-6 m-0 space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Capacity</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} placeholder="e.g. 200" {...field} />
                        </FormControl>
                        <FormDescription>Leave empty for unlimited registrations</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="registration_deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Deadline (Optional)</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Step 4: Details */}
              <TabsContent value="details" className="p-6 m-0 space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="eligibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eligibility Requirements</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g. Open to 3rd and 4th year CS students" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rules"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-2">
                          <FormLabel>Rules & Guidelines</FormLabel>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5"
                            onClick={() => generateWithAI('rules')}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Generate with AI
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea className="min-h-[150px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prizes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prizes & Perks</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g. 1st Prize: $500, Swags for all participants" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Step 5: Preview */}
              <TabsContent value="preview" className="p-6 m-0 space-y-6">
                <div className="rounded-lg bg-muted/30 p-6 border text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Ready to submit!</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Your event details look good. Once submitted, it will be sent to administrators for approval before going live on the platform.
                  </p>
                  
                  <div className="text-left bg-background p-4 rounded-md border text-sm max-w-md mx-auto space-y-2 mb-6">
                    <p><span className="font-medium">Title:</span> {form.watch('title') || 'Not provided'}</p>
                    <p><span className="font-medium">Type:</span> {form.watch('event_type')}</p>
                    <p><span className="font-medium">Start:</span> {form.watch('start_datetime') || 'Not provided'}</p>
                    <p><span className="font-medium">Capacity:</span> {form.watch('capacity') || 'Unlimited'}</p>
                  </div>

                  <Button type="submit" size="lg" className="w-full max-w-md" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                  </Button>
                </div>
              </TabsContent>

            </Tabs>
          </form>
        </Form>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/10">
          <Button 
            type="button" 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStepIndex === 0 || isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          
          {currentStepIndex < steps.length - 1 && (
            <Button 
              type="button" 
              onClick={nextStep}
              className="gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
