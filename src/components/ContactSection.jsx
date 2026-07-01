// React import not required with the current JSX transform; keep file free of unused imports
import { useForm, ValidationError } from '@formspree/react';
import { useInView } from '../hooks/useInView';

const inputClasses =
  "w-full bg-white rounded border border-ink/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-base outline-none text-ink py-1 px-3 leading-8 transition-colors duration-200 ease-in-out";

export const ContactForm = () => {
  const [state, handleSubmit] = useForm("mrgwdlab"); // Your Formspree form ID
  const [ref, isInView] = useInView();

  return (
    <section
      ref={ref}
      className={`bg-paper pt-20 md:pt-24 pb-10 md:pb-12 relative transition-all duration-700 ease-out ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="container mx-auto flex px-5 items-center justify-center max-w-2xl">
        <div className="w-full bg-white/60 rounded-xl shadow-sm border border-ink/10 p-8 md:p-10 flex flex-col justify-center">
          {state.succeeded ? (
            <div className="w-full flex flex-col items-center justify-center">
              <h2 className="font-display text-3xl mb-4 text-ink text-center">Thanks for reaching out!</h2>
              <p className="text-center text-ink/80">Ross R. Humer will get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full">
              <h2 className="font-display text-3xl mb-2 text-ink">Contact the Author</h2>
              <p className="mb-4 text-sm text-ink/70">
                Have a question for Ross R. Humer, feedback on the books, or a business
                inquiry? Send a message directly — for a fun chat about the books
                themselves, try the &quot;Ask Ari&quot; button in the corner instead!
              </p>
              <div className="md:flex md:space-x-4 mb-4">
                <div className="md:w-1/2">
                    <label htmlFor="name" className="leading-7 text-sm text-ink/70">
                    Name
                    </label>
                    <input
                    type="text"
                    id="name"
                    name="name"
                    className={inputClasses}
                    />
                </div>
                <div className="md:w-1/2">
                    <label htmlFor="email" className="leading-7 text-sm text-ink/70">
                    Email
                    </label>
                    <input
                    type="email"
                    id="email"
                    name="email"
                    className={inputClasses}
                    />
                    <ValidationError
                    prefix="Email"
                    field="email"
                    errors={state.errors}
                    />
                </div>
              </div>
              <div className="relative mb-4">
                <label htmlFor="message" className="leading-7 text-sm text-ink/70">
                  Your message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className={`${inputClasses} h-32 resize-none leading-6`}
                ></textarea>
                <ValidationError
                  prefix="Message"
                  field="message"
                  errors={state.errors}
                />
              </div>
              <button
                type="submit"
                disabled={state.submitting}
                className="text-paper bg-ink border-0 py-2 px-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 hover:bg-gold transition-colors duration-200 rounded-md text-lg"
              >
                Submit
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
