import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import ariImage from '../assets/ari.png';

export const ContactForm = () => {
  const [state, handleSubmit] = useForm("mrgwdlab"); // Your Formspree form ID

  return (
    <section className="text-gray-600 body-font relative">
      <div className="container mx-auto flex px-5 py-2 items-center justify-center flex-col md:flex-row max-w-5xl rounded-lg overflow-hidden">
        <div className="md:flex md:items-center md:w-1/4 p-4">
          <img src={ariImage} alt="Ari" className="object-cover object-center rounded-lg" />
        </div>
        <div className="md:w-3/4 p-10 flex flex-col justify-center">
          {state.succeeded ? (
            <div className="w-full flex flex-col items-center justify-center">
              <h2 className="text-3xl mb-4 text-gray-900 text-center">Ari will get back to you soon!</h2>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full">
              <h2 className="text-3xl mb-4 text-gray-900">Ask Ari</h2>
              <div className="md:flex md:space-x-4 mb-4">
                <div className="md:w-1/2">
                    <label htmlFor="name" className="leading-7 text-sm text-gray-600">
                    Name
                    </label>
                    <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                    />
                </div>
                <div className="md:w-1/2">
                    <label htmlFor="email" className="leading-7 text-sm text-gray-600">
                    Email
                    </label>
                    <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                    />
                    <ValidationError 
                    prefix="Email" 
                    field="email"
                    errors={state.errors}
                    />
                </div>
              </div>
              <div className="relative mb-4">
                <label htmlFor="message" className="leading-7 text-sm text-gray-600">
                  Ask Ari a question!
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
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
                className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
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
